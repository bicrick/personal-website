import React from 'react';
import './EventBus.css';

const SENSORS = ['Composer', 'Argo', 'Databricks', 'Informatica'];

const EVENTS = [
  { job: 'store_inventory', tone: 'ok' },
  { job: 'orders_load', tone: 'run' },
  { job: 'pos_sync', tone: 'ok' },
  { job: 'forecast_train', tone: 'ok' },
  { job: 'vendor_feed', tone: 'run' },
  { job: 'price_refresh', tone: 'ok' },
  { job: 'shelf_replen', tone: 'fail' },
  { job: 'catalog_sync', tone: 'ok' },
];

function Events({ copy }) {
  return EVENTS.map((event) => (
    <div key={`${copy ? 'b' : 'a'}-${event.job}`} className={`heb-ebus-ev${copy ? ' is-copy' : ''}`}>
      <i className={`is-${event.tone}`} />
      <span>{event.job}</span>
    </div>
  ));
}

function EventBus() {
  return (
    <div className="heb-fig heb-ebus" aria-hidden="true">
      <div className="heb-ebus-pane is-sensors">
        <span className="heb-ebus-kicker">sensors poll</span>
        <div className="heb-ebus-sensors">
          {SENSORS.map((name) => (
            <div key={name} className="heb-ebus-sensor">
              <i className="heb-ebus-dot" />
              <span>{name}</span>
              <span className="heb-ebus-wire"><i /></span>
            </div>
          ))}
        </div>
      </div>

      <div className="heb-ebus-link is-in"><i /></div>

      <div className="heb-ebus-pane is-bus">
        <span className="heb-ebus-kicker">ebus on Kafka</span>
        <div className="heb-ebus-stream">
          <div className="heb-ebus-events">
            <Events />
            <Events copy />
          </div>
        </div>
      </div>

      <div className="heb-ebus-link is-out"><i /></div>

      <div className="heb-ebus-pane is-service">
        <span className="heb-ebus-kicker">dependency service consumes</span>

        <div className="heb-ebus-job is-a">
          <span className="heb-ebus-job-name">store_inventory</span>
          <span className="heb-ebus-job-meta">
            Composer
            <span className="heb-ebus-state">
              <b className="is-before">running</b>
              <b className="is-after">done</b>
            </span>
          </span>
        </div>

        <div className="heb-ebus-dep" />

        <div className="heb-ebus-job is-b">
          <span className="heb-ebus-job-name">inventory_rollup</span>
          <span className="heb-ebus-job-meta">
            Databricks
            <span className="heb-ebus-state">
              <b className="is-before">waiting</b>
              <b className="is-after">ready</b>
            </span>
          </span>
        </div>

        <span className="heb-ebus-kicker is-queue">enqueue on Databricks</span>
        <div className="heb-ebus-slot is-old">vendor_feed</div>
        <div className="heb-ebus-slot-new">
          <div className="heb-ebus-slot is-hole" />
          <div className="heb-ebus-slot is-job">+ inventory_rollup</div>
        </div>
      </div>
    </div>
  );
}

export default EventBus;
