import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import HebMarkRow from '../components/heb/HebMarkRow';
import HebShot from '../components/heb/HebShot';
import HebToolLane from '../components/heb/HebToolLane';
import '../components/heb/Heb.css';

function Heb() {
  return (
    <ProjectDetail
      title="data engineering at h-e-b"
      date="2023-2026"
      abstract="I build the control room for data engineering at H-E-B. One internal product. Every failed job, missed SLA, and late extract shows up there. I started it on AWS by hand. I am finishing the rewrite on GCP with agents in the loop."
    >
      <figure className="project-figure heb-title">
        <img
          className="heb-logo"
          src={`${process.env.PUBLIC_URL}/images/heb/heb-logo.png`}
          alt="H-E-B"
        />
      </figure>

      <h2>/ the job</h2>

      <p>
        H-E-B runs on pipelines. If a job dies at 3am, someone has to see it before a store does. I own the surface those people live on: the data engineering dashboard. Not a side project. The place teams come when something is on fire, and the place they come when they want to prove it is not.
      </p>

      <p>
        I have been shipping it since May 2023. Hundreds of completed tickets. Two repositories still taking commits in the same week. I do not wait for a platform team to modernize the stack. I learn the next one and move the product onto it.
      </p>

      <HebShot
        label="home / the control room"
        note="screenshot of the live home page, no production numbers"
      />

      <h2>/ impact</h2>

      <p>
        Before this app, workflow health lived in six tools and a Slack thread. I pulled failed runs, SLAs, extracts, Tableau refreshes, Kafka dependencies, and on-call into one product. A team can filter to its own world. A lead can see the whole platform. That is the difference between hunting and operating.
      </p>

      <p>
        I also built the first version of asking the wiki instead of searching it. A chat box, a vector store, Confluence behind it. This was 2024, before Rovo. If you wanted an answer from internal docs, you asked the thing I wired up.
      </p>

      <HebShot
        label="chat / confluence rag"
        note="the 2024 chat UI. docs in, answer out. before rovo."
      />

      <h2>/ the stack</h2>

      <p>
        The product is a React UI on a Python API. It started on AWS, in containers, on a cluster. It is moving to GCP: Cloud Run, Cloud SQL, Firestore for live status, BigQuery for table watermarks, Composer for the DAGs. Kafka is the bus either way. I write the Terraform. I write the pages. I write the collectors that feed them.
      </p>

      <HebMarkRow
        ids={[
          'python',
          'react',
          'fastapi',
          'docker',
          'aws',
          'kubernetes',
          'gcp',
          'cloudrun',
          'bigquery',
          'cloudsql',
          'firestore',
          'composer',
          'kafka',
          'tableau',
          'confluence',
          'terraform',
        ]}
        caption="what the dashboard sits on. I have shipped production code against all of this."
      />

      <h2>/ moving the plant</h2>

      <p>
        In 2025 I wrote the plan to leave the old cluster. One container on EKS was fine until it was not. The rewrite is a second repo, stood up that September. 2026 is the year the new plant started taking real load: Composer events, ingest history, BigQuery watermarks, live status on Firestore. I am still keeping the old dashboard alive while I cut the new one over. That is the hard part. Anyone can start a greenfield. Fewer people keep both in the air.
      </p>

      <HebShot
        label="gcp / composer and watermarks"
        note="the new dashboard. composer runs, ingest, bigquery watermarks."
      />

      <p>
        Last month I took Teradata out of the old UI and put an SLA page on the new one. Same week. That is how I work. Deprecate the dying thing. Ship the next one. Do not leave a hole in the middle.
      </p>

      <h2>/ how I actually build</h2>

      <p>
        The first year I typed every line. When I got stuck I pasted into ChatGPT or Claude in a browser tab and copied the answer back. Then I put the model in the editor. Cursor first. Claude Code next to it. I am not waiting for a training to tell me the stack moved. I move with it, and the dashboard gets faster because of that.
      </p>

      <HebToolLane
        rows={[
          { year: '2023', ids: ['chatgpt'] },
          { year: '2024', ids: ['chatgpt', 'claude'] },
          { year: '2025', ids: ['cursor', 'claudecode'] },
          { year: '2026', ids: ['cursor', 'claudecode'] },
        ]}
        caption="same job. the loop around the code is what changed."
      />

      <figure className="heb-heatmap">
        <CursorActivityHeatmap />
      </figure>
    </ProjectDetail>
  );
}

export default Heb;
