// modules/inject-styles.js
export function injectPinButtonStyle() {
    if (document.getElementById('home-quick-pin-style')) return;
    const style = document.createElement('style');
    style.id = 'home-quick-pin-style';
    style.textContent = `
        .home-quick-card {
            position: relative;
        }
        .home-quick-pin {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(4px);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.15s, background 0.15s;
            z-index: 2;
            color: rgba(255,255,255,0.7);
        }
        .home-quick-card:hover .home-quick-pin {
            opacity: 1;
        }
        .home-quick-pin:hover {
            background: rgba(255,80,80,0.2);
            color: #ff8585;
        }
        .home-quick-pin svg {
            width: 14px;
            height: 14px;
            stroke: currentColor;
            stroke-width: 1.5;
            fill: none;
        }
    `;
    document.head.appendChild(style);
}