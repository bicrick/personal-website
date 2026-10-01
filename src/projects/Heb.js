import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import HebSpread from '../components/heb/HebSpread';
import ApiTrace from '../components/heb/stills/ApiTrace';
import DatabaseTable from '../components/heb/stills/DatabaseTable';
import LogCause from '../components/heb/stills/LogCause';
import OnePlace from '../components/heb/stills/OnePlace';
import UiTicket from '../components/heb/stills/UiTicket';
import WikiAsk from '../components/heb/stills/WikiAsk';
import HebStack from '../components/heb/HebStack';
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
          Then the data. Postgres held the history, the DDL, the pipelines, and the logs. I learned to manage the database the jobs depended on.
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
          Composer, Argo, Databricks, and Informatica are separate systems. The jobs on each one still had to be tracked and monitored.
        </p>
        <p>
          Those runs all go to the ebus. The dependency service feeds off that stream and can queue a new job, including one that runs on another platform. One orchestrator for all of them.
        </p>
      </HebSpread>

      <HebSpread year="2025">
        <p>
          Then the infrastructure. I learned to manage it with Terraform, so the plant was something I could change in code instead of by hand.
        </p>
        <p>
          In early 2025 I was promoted to Data Engineer II. A lot of the growth after that was other people. I mentored junior engineers, and I ran two rounds of interns.
        </p>
      </HebSpread>

      <HebSpread year="2026">
        <p>
          I am leading the migration of our data engineering infrastructure to GCP. The AWS systems stay in place while that move happens.
        </p>
      </HebSpread>

      <HebStack />
    </ProjectDetail>
  );
}

export default Heb;
