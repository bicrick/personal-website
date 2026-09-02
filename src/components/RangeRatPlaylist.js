import './RangeRatPlaylist.css';

const PLAYLIST_HREF = 'https://suno.com/playlist/535536db-8be4-4c2c-af9c-b65212f0a22a';
const COVER = `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-playlist-cover.jpg`;

function RangeRatPlaylist() {
  return (
    <figure className="project-figure range-rat-playlist">
      <a
        className="range-rat-playlist-row"
        href={PLAYLIST_HREF}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="range-rat-playlist-cover"
          src={COVER}
          alt=""
          width={72}
          height={72}
        />
        <span className="range-rat-playlist-copy">
          <span className="range-rat-playlist-title">range-rat.game</span>
          <span className="range-rat-playlist-meta">
            8 chiptune tracks by bicrick, on Suno
          </span>
        </span>
      </a>
      <figcaption>
        The soundtrack playlist. Open it on Suno.
      </figcaption>
    </figure>
  );
}

export default RangeRatPlaylist;
