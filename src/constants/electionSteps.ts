export interface ElectionStep {
  id: number;
  title: string;
  description: string;
  deadline: string;
  prompt: string;
}

export const ELECTION_STEPS: ElectionStep[] = [
  {
    id: 1,
    title: 'Voter Registration',
    description: 'Ensure you are registered to vote before the deadline.',
    deadline: 'October 7th, 2024',
    prompt: 'What are the requirements for voter registration?',
  },
  {
    id: 2,
    title: 'Primary Election',
    description: 'Vote to select the candidates for the general election.',
    deadline: 'Various dates by state',
    prompt: 'How do primary elections work?',
  },
  {
    id: 3,
    title: 'General Election',
    description: 'Cast your final vote for the candidates.',
    deadline: 'November 5th, 2024',
    prompt: 'What happens on Election Day?',
  },
  {
    id: 4,
    title: 'Results',
    description: 'Votes are counted and preliminary results are announced.',
    deadline: 'November 6th, 2024',
    prompt: 'How are election results verified?',
  },
  {
    id: 5,
    title: 'Certification',
    description: 'The final, official results are certified.',
    deadline: 'December 2024',
    prompt: 'What is election certification?',
  },
];
