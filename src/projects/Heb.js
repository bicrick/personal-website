import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import HebSpread from '../components/heb/HebSpread';
import ApiTrace from '../components/heb/stills/ApiTrace';
import DatabaseTable from '../components/heb/stills/DatabaseTable';
import EventBus from '../components/heb/stills/EventBus';
import LogCause from '../components/heb/stills/LogCause';
import OnePlace from '../components/heb/stills/OnePlace';
import UiTicket from '../components/heb/stills/UiTicket';
import RunHistory from '../components/heb/stills/RunHistory';
import TerraformApply from '../components/heb/stills/TerraformApply';
import WikiAsk from '../components/heb/stills/WikiAsk';
import HebStack from '../components/heb/HebStack';
import '../components/heb/Heb.css';
import '../components/heb/HebStills.css';
import '../components/heb/HebFigures.css';
import '../components/heb/HebMotion.css';
import '../components/heb/HebMl.css';

function Heb() {
  return (
    <ProjectDetail
      title="data platform engineering at"
      titleLabel="data platform engineering at h-e-b"
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
          I had just graduated college. This was my first full-time job as a software engineer. I started the way most engineers do, on a simple page. A table of jobs, a filter, the screen a team opened in the morning. I typed every line of TypeScript myself.
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
          Then the data. RDS Postgres on AWS held the history, the DDL, the pipelines, and the logs. I learned to manage the database the jobs depended on.
        </p>
        <DatabaseTable />
      </HebSpread>

      <HebSpread>
        <p>
          Then I built one environment for every data engineer in the org. They could track a process, see why a job failed, configure an SLA, look through past executions, and examine the cost. All of it in one place.
        </p>
        <OnePlace />
      </HebSpread>

      <HebSpread>
        <p>
          I even added a few features on top of that. I spun up a persistent LLM to ingest log failures from extracts and the other data pipelines, and to find the root cause. An engineer could see why the job failed without opening the trace.
        </p>
        <LogCause />
      </HebSpread>

      <HebSpread year="2024">
        <p>
          I built a RAG assistant over the wiki, so an engineer could ask the dashboard instead of searching Confluence. This was before Rovo.
        </p>
        <WikiAsk />
      </HebSpread>

      <HebSpread>
        <p>
          And now the real meat and potatoes. I went from managing the dashboard to building a heterogeneous orchestrator that tracks dependencies and enqueues jobs across platforms.
        </p>
        <EventBus />
      </HebSpread>

      <HebSpread>
        <p>
          Composer, Argo, Databricks, and Informatica are separate systems. The jobs on each one still had to be tracked and monitored.
        </p>
        <p>
          Those runs all go to the ebus, a Kafka event bus. The dependency service consumes off that stream, tracks what depends on what, and can queue a new job, including one that runs on another platform. One orchestrator for all of them.
        </p>
      </HebSpread>

      <HebSpread year="2025">
        <p>
          I picked up Terraform and started managing our infrastructure as code. I was promoted in early 2025, and I mentored junior engineers and helped run two rounds of interns.
        </p>
        <TerraformApply />
      </HebSpread>

      <HebSpread>
        <p>
          I also brought our Vertex AI jobs into the dashboard. These are the machine learning jobs behind our forecasting and inventory work. Their pipelines, schedules, and endpoints now sit next to everything else.
        </p>
        <RunHistory />
      </HebSpread>

      <HebSpread year="2026">
        <p>
          Training info and metrics are on the page too, along with any errors, so you do not need console access to see why a job failed.
        </p>
        <p>
          I am now leading the migration of our data platform to GCP. The AWS systems stay in place during the move.
        </p>
      </HebSpread>

      <HebStack />
    </ProjectDetail>
  );
}

export default Heb;
