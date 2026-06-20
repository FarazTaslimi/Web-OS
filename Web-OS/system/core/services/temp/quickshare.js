// system/services/quickshare.js
(function() {
  class QuickShareService {
    constructor() {
      this.panel = null;
      this.roomId = '';
      this.localIP = '';
      this.ws = null;
      this.pc = null;
      this.dataChannel = null;
      this._incomingFile = null;
      this._init();
    }

    _init() {
      this._ensurePanel();
      this._bindQuickSettings();
    }

    _ensurePanel() {
      if (document.getElementById('qs-panel')) {
        this.panel = document.getElementById('qs-panel');
        return;
      }
      var panel = document.createElement('div');
      panel.id = 'qs-panel';
      panel.className = 'panel';
      panel.innerHTML = '<div style="padding:20px; text-align:center;">'
        + '<h3>⚡ Quick Share</h3>'
        + '<div id="qs-status" style="margin:10px 0; font-size:0.85rem; color:var(--text-secondary);">Ready</div>'
        + '<div id="qs-qr" style="margin:12px 0; min-height:200px; display:flex; align-items:center; justify-content:center;">'
        + '<span style="color:var(--text-dim);">Click "Start Sharing" to generate QR</span>'
        + '</div>'
        + '<div id="qs-room" style="font-size:0.8rem; color:var(--accent); margin-bottom:10px;"></div>'
        + '<button id="qs-start-btn" class="bt-send-btn" style="width:100%;">📱 Start Sharing</button>'
        + '<button id="qs-send-file-btn" class="bt-send-btn" style="width:100%; display:none;">📁 Send File</button>'
        + '</div>';
      document.body.appendChild(panel);
      this.panel = panel;
      this._bindPanelEvents();
    }

    _bindPanelEvents() {
      var self = this;
      var startBtn = document.getElementById('qs-start-btn');
      var sendBtn  = document.getElementById('qs-send-file-btn');
      if (startBtn) startBtn.addEventListener('click', function() { self._startSharing(); });
      if (sendBtn)  sendBtn.addEventListener('click',  function() { self._sendFile(); });
    }

    _bindQuickSettings() {
      var self = this;
      var label = document.querySelector('label[for="qs-share-cb"]');
      if (!label) return;
      label.addEventListener('click', function(e) {
        e.stopPropagation();
        var volPanel = document.getElementById('vol-panel');
        if (volPanel) volPanel.classList.remove('show');
        self._togglePanel();
      });
    }

    _togglePanel() {
      if (!this.panel) return;
      if (this.panel.classList.contains('show')) {
        this.panel.classList.remove('show');
      } else {
        document.querySelectorAll('.panel.show').forEach(function(p) { p.classList.remove('show'); });
        this.panel.style.display    = 'block';
        this.panel.style.visibility = 'hidden';
        this._adjustPosition();
        this.panel.style.visibility = 'visible';
        this.panel.classList.add('show');
      }
    }

    _adjustPosition() {
      var tb = document.getElementById('taskbar');
      if (!tb) return;
      var r = tb.getBoundingClientRect();
      this.panel.style.right  = (window.innerWidth - r.right) + 'px';
      this.panel.style.top    = (r.top - this.panel.offsetHeight - 10) + 'px';
      this.panel.style.left   = 'auto';
      this.panel.style.bottom = 'auto';
    }

    async _startSharing() {
      var self     = this;
      var statusEl = document.getElementById('qs-status');
      var qrDiv    = document.getElementById('qs-qr');
      var roomSpan = document.getElementById('qs-room');
      var startBtn = document.getElementById('qs-start-btn');
      var sendBtn  = document.getElementById('qs-send-file-btn');

      try {
        statusEl.textContent = 'Generating QR…';
        var res  = await fetch('/api/quickshare/qr');
        var data = await res.json();
        this.roomId  = data.roomId;
        this.localIP = data.localIP;

        qrDiv.innerHTML        = data.qrSvg;
        roomSpan.textContent   = 'Room: ' + data.roomId;
        startBtn.style.display = 'none';
        sendBtn.style.display  = 'block';
        sendBtn.disabled       = true;

        // WebRTC setup
        this.pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        this.dataChannel = this.pc.createDataChannel('files');
        this.dataChannel.binaryType = 'arraybuffer';

        this.dataChannel.onopen = function() {
          statusEl.textContent = '✅ Connected! Ready to transfer.';
          sendBtn.disabled = false;
        };

        this.dataChannel.onmessage = function(e) {
          if (typeof e.data === 'string') {
            var info = JSON.parse(e.data);
            if (info.type === 'file-info') {
              self._incomingFile = { name: info.name, size: info.size, chunks: [] };
              statusEl.textContent = '📥 Receiving: ' + info.name;
            }
          } else if (self._incomingFile) {
            self._incomingFile.chunks.push(e.data);
            var received = self._incomingFile.chunks.reduce(function(s,c){ return s + c.byteLength; }, 0);
            if (received >= self._incomingFile.size) {
              var blob = new Blob(self._incomingFile.chunks);
              var a    = document.createElement('a');
              a.href     = URL.createObjectURL(blob);
              a.download = self._incomingFile.name;
              a.click();
              statusEl.textContent = '✅ Received: ' + self._incomingFile.name;
              self._incomingFile   = null;
            }
          }
        };

        this.pc.onicecandidate = function(e) {
          if (e.candidate && self.ws && self.ws.readyState === 1) {
            self.ws.send(JSON.stringify({ type: 'candidate', candidate: e.candidate }));
          }
        };

        // ★ مهم: host باید با IP واقعی وصل بشه نه localhost
        var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        var wsHost   = this.localIP + ':' + (location.port || '8080');
        this.ws = new WebSocket(protocol + '://' + wsHost + '/?room=' + this.roomId);

        this.ws.onopen = function() {
          console.log('Host WS open:', wsHost, 'room:', self.roomId);
          statusEl.textContent = 'Scan QR with your phone…';
        };

        this.ws.onmessage = async function(e) {
          var msg = JSON.parse(e.data);
          console.log('Host got:', msg.type);

          if (msg.type === 'ready') {
            statusEl.textContent = '📡 Phone connected, linking…';
            var offer = await self.pc.createOffer();
            await self.pc.setLocalDescription(offer);
            self.ws.send(JSON.stringify({ type: 'offer', sdp: self.pc.localDescription }));

          } else if (msg.type === 'answer') {
            await self.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));

          } else if (msg.type === 'candidate') {
            try { await self.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch(e) {}
          }
        };

        this.ws.onerror = function(e) {
          console.error('Host WS error', e);
          statusEl.textContent = '❌ Connection error';
        };

      } catch(err) {
        statusEl.textContent = 'Error: ' + err.message;
        console.error(err);
      }
    }

    async _sendFile() {
      var self     = this;
      var statusEl = document.getElementById('qs-status');

      if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
        alert('Not connected to phone yet');
        return;
      }

      try {
        var res  = await fetch('/api/workspace/files');
        var data = await res.json();
        if (!data.files || !data.files.length) { alert('No files in workspace folder'); return; }
        var fileName = prompt('Files in workspace:\n' + data.files.join('\n') + '\n\nEnter filename:');
        if (!fileName || !data.files.includes(fileName)) return;

        var fileRes = await fetch('/workspace/' + encodeURIComponent(fileName));
        var blob    = await fileRes.blob();
        var buf     = await blob.arrayBuffer();

        this.dataChannel.send(JSON.stringify({ type: 'file-info', name: fileName, size: buf.byteLength }));
        var chunkSize = 16384;
        for (var i = 0; i < buf.byteLength; i += chunkSize) {
          this.dataChannel.send(buf.slice(i, i + chunkSize));
        }
        statusEl.textContent = '✅ Sent: ' + fileName;
      } catch(err) {
        alert('Error: ' + err.message);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.QuickShareService = new QuickShareService();
    });
  } else {
    window.QuickShareService = new QuickShareService();
  }
})();
