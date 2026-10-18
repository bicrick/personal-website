import BloubFace from './bloub/BloubFace';

export const GROK_BOT_URL = 'https://x.ai/bot';

export default function GrokBot() {
  return (
    <a
      className="grok-bot-link"
      href={GROK_BOT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Grok Bot"
    >
      <title>Grok Bot</title>
      <g className="grok-bot" transform="translate(241.2 151.2) scale(0.34)">
        <g className="grok-bot-body">
          <BloubFace headClass="grok-bot-head" mode="bead" />
        </g>
      </g>
    </a>
  );
}
