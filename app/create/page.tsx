import dynamic from 'next/dynamic'

const CreateJobForm = dynamic(() => import('./create-form'), { ssr: false })

export default function CreateJobPage() {
  return <CreateJobForm />
}
