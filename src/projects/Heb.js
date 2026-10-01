import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import HebSpread from '../components/heb/HebSpread';
import ApiTrace from '../components/heb/stills/ApiTrace';
import AwsDiagram from '../components/heb/stills/AwsDiagram';
import DatabaseTable from '../components/heb/stills/DatabaseTable';
import EventBus from '../components/heb/stills/EventBus';
import LogCause from '../components/heb/stills/LogCause';
import UiTicket from '../components/heb/stills/UiTicket';
import WikiAsk from '../components/heb/stills/WikiAsk';
import '../components/heb/Heb.css';
import '../components/heb/HebStills.css';
import '../components/heb/HebFigures.css';
import '../components/heb/HebMotion.css';

function Heb() {
  return (
    <ProjectDetail
      title="data engineering at"
      titleLabel="data engineering at h-e-b"
      titleSuffix={(
        <img
          className="project-title-logo"
          src={`${process.env.PUBLIC_URL}/images/heb/heb-logo.png`}
          alt=""
        />
      )}
      date="2023-2026"
      backHref="/career"
      backLabel="career"
    >
      <HebSpread year="2023">
        <p>
          I had just graduated college. This was my first full-time job as a software engineer. I typed every line of TypeScript myself. I started the way most engineers do, on a simple page. A table of jobs, a filter, the screen a team opened in the morning.
        </p>
        <UiTicket />
      </HebSpread>

      <HebSpread>
        <p>
          The page needed a service. I took the backend: the routes and the APIs the screen called. The work moved from the file in front of me to the system behind it.
        </p>
        <ApiTrace />
      </HebSpread>

      <HebSpread>
        <p>
          Then the data. Postgres held the history, the DDL, the pipelines, and the logs. I learned to manage the database the jobs depended on.
        </p>
        <DatabaseTable />
      </HebSpread>

      <HebSpread>
        <p>
          I spun up a persistent LLM to ingest log failures from extracts and the other data pipelines, and to find the root cause. An engineer could see why the job failed without opening the trace.
        </p>
        <LogCause />
      </HebSpread>

      <HebSpread>
        <p>
          I built a RAG assistant over the wiki, so an engineer could ask the dashboard instead of searching Confluence. This was before Rovo.
        </p>
        <WikiAsk />
      </HebSpread>

      <HebSpread>
        <p>
          Then I learned to ship it. Kubernetes and Argo CD. I deployed what I had built, and I owned the network in front of it.
        </p>
      </HebSpread>

      <HebSpread>
        <p>
          The app lived on AWS. I learned the cluster, Lambdas, and the buckets. The page, the API, and Postgres were one production app, and I became Data Engineer II.
        </p>
        <AwsDiagram />
      </HebSpread>

      <HebSpread>
        <p>
          Composer, Argo, Databricks, and Informatica are separate systems. Each one publishes its run events onto the ebus, and the bus collects all of them. The dependency service reads that stream. Other data engineers use it to orchestrate a job that is waiting on data from a different platform.
        </p>
        <EventBus />
      </HebSpread>

      <HebSpread>
        <p>
          A new cloud, and a new app. I learned GCP while the AWS plant stayed up, and I stood the rewrite up from the architecture. Scale, CI/CD, and alerting were in the plan. Cloud Run, Cloud Storage, BigQuery, Composer. That plant took real load.
        </p>
      </HebSpread>
    </ProjectDetail>
  );
}

export default Heb;
