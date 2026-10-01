import React from 'react';
import { ReactComponent as Python } from './icons/python.svg';
import { ReactComponent as ReactIcon } from './icons/react.svg';
import { ReactComponent as FastApi } from './icons/fastapi.svg';
import { ReactComponent as Docker } from './icons/docker.svg';
import { ReactComponent as Aws } from './icons/aws.svg';
import { ReactComponent as Gcp } from './icons/gcp.svg';
import { ReactComponent as BigQuery } from './icons/bigquery.svg';
import { ReactComponent as Kafka } from './icons/kafka.svg';
import { ReactComponent as Kubernetes } from './icons/kubernetes.svg';
import { ReactComponent as Argo } from './icons/argo.svg';
import { ReactComponent as Postgres } from './icons/postgres.svg';
import { ReactComponent as CloudRun } from './icons/cloudrun.svg';
import { ReactComponent as Storage } from './icons/storage.svg';
import { ReactComponent as Firestore } from './icons/firestore.svg';
import { ReactComponent as CloudSql } from './icons/cloudsql.svg';
import { ReactComponent as Composer } from './icons/composer.svg';
import { ReactComponent as Tableau } from './icons/tableau.svg';
import { ReactComponent as Confluence } from './icons/confluence.svg';
import { ReactComponent as Terraform } from './icons/terraform.svg';
import { ReactComponent as ChatGpt } from './icons/chatgpt.svg';
import { ReactComponent as Claude } from './icons/claude.svg';
import { ReactComponent as Cursor } from './icons/cursor.svg';
import { ReactComponent as ClaudeCode } from './icons/claudecode.svg';

function Icon({ Svg }) {
  return <Svg aria-hidden="true" focusable="false" />;
}

export const MARKS = {
  python: { label: 'Python', icon: <Icon Svg={Python} /> },
  react: { label: 'React', icon: <Icon Svg={ReactIcon} /> },
  fastapi: { label: 'FastAPI', icon: <Icon Svg={FastApi} /> },
  docker: { label: 'Docker', icon: <Icon Svg={Docker} /> },
  aws: { label: 'AWS', icon: <Icon Svg={Aws} /> },
  gcp: { label: 'GCP', icon: <Icon Svg={Gcp} /> },
  bigquery: { label: 'BigQuery', icon: <Icon Svg={BigQuery} /> },
  kafka: { label: 'Kafka', icon: <Icon Svg={Kafka} /> },
  kubernetes: { label: 'Kubernetes', icon: <Icon Svg={Kubernetes} /> },
  argo: { label: 'Argo CD', icon: <Icon Svg={Argo} /> },
  postgres: { label: 'Postgres', icon: <Icon Svg={Postgres} /> },
  cloudrun: { label: 'Cloud Run', icon: <Icon Svg={CloudRun} /> },
  storage: { label: 'Cloud Storage', icon: <Icon Svg={Storage} /> },
  firestore: { label: 'Firestore', icon: <Icon Svg={Firestore} /> },
  cloudsql: { label: 'Cloud SQL', icon: <Icon Svg={CloudSql} /> },
  composer: { label: 'Composer', icon: <Icon Svg={Composer} /> },
  tableau: { label: 'Tableau', icon: <Icon Svg={Tableau} /> },
  confluence: { label: 'Confluence', icon: <Icon Svg={Confluence} /> },
  terraform: { label: 'Terraform', icon: <Icon Svg={Terraform} /> },
  chatgpt: { label: 'ChatGPT', icon: <Icon Svg={ChatGpt} /> },
  claude: { label: 'Claude', icon: <Icon Svg={Claude} /> },
  cursor: { label: 'Cursor', icon: <Icon Svg={Cursor} /> },
  claudecode: { label: 'Claude Code', icon: <Icon Svg={ClaudeCode} /> },
};
