import React from 'react';
import T100Card from './T100Card';
import './T100TilePreview.css';

function T100TilePreview() {
  return (
    <div className="t100-tile-preview" aria-hidden="true">
      <T100Card compact interactive={false} />
    </div>
  );
}

export default T100TilePreview;
