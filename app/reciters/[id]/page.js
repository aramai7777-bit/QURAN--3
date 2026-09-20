import ReciterProfileClient from './ReciterProfileClient';

export function generateMetadata({ params }) {
  return { title: `قارئ رقم ${params.id} — القرّاء` };
}

export default function ReciterProfilePage({ params }) {
  return <ReciterProfileClient reciterId={Number(params.id)} />;
}
