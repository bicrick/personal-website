import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import CursorActivityHeatmap from '../components/CursorActivityHeatmap';
import HebMarkRow from '../components/heb/HebMarkRow';
import HebSpread from '../components/heb/HebSpread';
import HebToolLane from '../components/heb/HebToolLane';
import EventBus from '../components/heb/stills/EventBus';
import NightBoard from '../components/heb/stills/NightBoard';
import PlantPath from '../components/heb/stills/PlantPath';
import TwoPlants from '../components/heb/stills/TwoPlants';
import UiTicket from '../components/heb/stills/UiTicket';
import WikiAsk from '../components/heb/stills/WikiAsk';
import '../components/heb/Heb.css';
import '../components/heb/HebStills.css';

function Heb() {
  return (
    <ProjectDetail
      title="data engineering at h-e-b"
      date="2023-2026"
      abstract="I build the control room for data engineering at H-E-B. I started on the UI in 2023. I run the plant now."
    >
      <figure className="project-figure heb-title">
        <img
          className="heb-logo"
          src={`${process.env.PUBLIC_URL}/images/heb/heb-logo.png`}
          alt="H-E-B"
        />
      </figure>

      <HebSpread
        year="2023"
        caption="I started on small UI. Tables, filters, pages."
      >
        <UiTicket />
      </HebSpread>

      <HebSpread
        year="2023"
        caption="That UI became the control room. Failed jobs, SLAs, extracts, Tableau, on-call. EKS, 10+ teams."
      >
        <NightBoard />
      </HebSpread>

      <HebSpread
        year="2024"
        caption="I put a chat box on the wiki. Confluence behind it, before Rovo."
      >
        <WikiAsk />
      </HebSpread>

      <HebSpread
        year="2024–25"
        caption="I learned the rest of the plant. Deploys, the network, Argo CD."
      >
        <PlantPath />
      </HebSpread>

      <HebSpread
        year="2025"
        caption="Composer, Argo, and Databricks publish into Kafka. Lineage sits on that bus."
      >
        <EventBus />
      </HebSpread>

      <HebSpread
        year="2026"
        caption="The GCP rewrite took load. The AWS dashboard stayed up through the cutover."
      >
        <TwoPlants />
      </HebSpread>

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
        caption="Shipped in production."
      />

      <HebToolLane
        rows={[
          { year: '2023', ids: ['chatgpt'] },
          { year: '2024', ids: ['chatgpt', 'claude'] },
          { year: '2025', ids: ['cursor', 'claudecode'] },
          { year: '2026', ids: ['cursor', 'claudecode'] },
        ]}
        caption="The first year I typed every line. Then the model moved into the editor."
      />

      <figure className="heb-heatmap">
        <CursorActivityHeatmap />
      </figure>
    </ProjectDetail>
  );
}

export default Heb;
