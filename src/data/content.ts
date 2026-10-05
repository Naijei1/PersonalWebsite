export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const profile = {
  name: 'Naijei Jiang',
  firstName: 'Naijei',
  role: 'Backend & systems engineer',
  tagline:
    'I build backend services and the systems underneath them: Kafka infrastructure at GEICO, a peer-to-peer downloader at Cornell, and the occasional AR drum kit.',
  intro:
    'Backend first, systems all the way down. I like APIs, data pipelines, schedulers, and networks, and making them fast and reliable.',
  photo: asset('project-logos/naijei-owner.png'),
  location: 'Ithaca & Rochester, NY',
  email: 'nj277@cornell.edu',
  now: ['Leading backend for a P2P downloader', 'TA for CS 2110', 'Learning Rust'],
}

export type Link = { label: string; href: string; handle: string }

export const links: Link[] = [
  { label: 'Email', href: `mailto:${profile.email}`, handle: profile.email },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/naijei', handle: 'in/naijei' },
  { label: 'GitHub', href: 'https://github.com/Naijei1', handle: '@Naijei1' },
  { label: 'YouTube', href: 'https://www.youtube.com/@itznaijei6316', handle: '@ItzNaijei' },
  { label: 'Instagram', href: 'https://www.instagram.com/naijeie/', handle: '@naijeie' },
]

export const education = {
  school: 'Cornell University',
  degree: 'B.S. Computer Science',
}

export type Experience = {
  org: string
  role: string
  period: string
  place: string
  current?: boolean
  bullets: string[]
  tags: string[]
}

export const experience: Experience[] = [
  {
    org: 'GEICO',
    role: 'Software Engineering Intern',
    period: '2026',
    place: 'New York Metro',
    bullets: [
      'Built Kafka schema infrastructure with Terraform.',
      'Developed AI agent workflows for claims operations.',
    ],
    tags: ['Backend', 'Kafka', 'Terraform', 'AI Agents'],
  },
  {
    org: 'Cornell Data Science',
    role: 'Technical Chair (Elected) · Data Engineering Tech Lead',
    period: 'Sep 2025 – Present',
    place: 'Ithaca, NY',
    current: true,
    bullets: [
      'Leading a 7-person team building a peer-to-peer, chunked distributed downloader with integrity checks to cut origin-server load.',
      'Designed a 6-node cluster for AI workloads with Slurm scheduling and NFS storage, plus a real-time CPU/GPU health dashboard.',
    ],
    tags: ['Backend', 'Distributed Systems', 'gRPC', 'Slurm'],
  },
  {
    org: 'Cornell Bowers CIS',
    role: 'Teaching Assistant · CS 2110 Data Structures & Algorithms',
    period: 'Aug 2025 – Present',
    place: 'Ithaca, NY',
    current: true,
    bullets: [
      'Run discussion sections for 34 students in a 300+ student Java course covering graphs, concurrency, and GUIs.',
      'Mentor students on JUnit testing and asymptotic analysis.',
    ],
    tags: ['Java', 'Algorithms', 'Teaching'],
  },
  {
    org: 'Astra',
    role: 'Founding Engineer',
    period: 'Jan 2026 – Feb 2026',
    place: 'Remote',
    bullets: [
      'Built and optimized an MCP server for agent workflows, cutting end-to-end response time from ~10s to ~5s.',
      'Integrated the Canvas API and shipped a file upload and processing pipeline; fixed intent routing for better tool-call accuracy.',
    ],
    tags: ['Backend', 'Python', 'Flask', 'MCP', 'Gemini API'],
  },
  {
    org: 'Cornell Bowers CIS',
    role: 'CSMore Intern',
    period: 'Jul 2025 – Aug 2025',
    place: 'Ithaca, NY',
    bullets: [
      'Explored functional programming, RISC-V architecture, and low-level systems programming with Docker-based workflows.',
    ],
    tags: ['RISC-V', 'OCaml', 'Docker'],
  },
  {
    org: 'Cornell WebDev',
    role: 'Backend Developer',
    period: 'Jan 2025 – May 2025',
    place: 'Ithaca, NY',
    bullets: [
      'Applied MongoDB to an existing backend and fixed critical login, logout-crash, and avatar-rendering bugs.',
    ],
    tags: ['Backend', 'Node.js', 'MongoDB'],
  },
  {
    org: 'C-DIME Computer Systems Lab',
    role: 'Lead Software Engineer',
    period: 'Aug 2022 – Sep 2024',
    place: 'Rochester, NY',
    bullets: [
      'Led a 4-person team running sprints to ship a VR bioprinting prototype tested by 20+ users; modeled and animated assets in Blender.',
    ],
    tags: ['Unity', 'C#', 'VR', 'Team Lead'],
  },
  {
    org: 'Rochester Institute of Technology',
    role: 'Software Developer Intern',
    period: 'Jul 2023 – Aug 2023',
    place: 'Rochester, NY',
    bullets: ['Built a laser-processing framework with ~2% runtime-prediction error and a 25 ms position read cycle.'],
    tags: ['C#', 'TCP', 'Performance'],
  },
]

export type SceneId = 'groovy' | 'downloader' | 'cluster' | 'seeround' | 'bioprint'

export type Featured = {
  id: SceneId
  name: string
  kicker: string
  award?: string
  summary: string
  idea: string
  bullets: string[]
  tags: string[]
  accent: string
  links: { label: string; href: string }[]
}

export const featured: Featured[] = [
  {
    id: 'groovy',
    name: 'GroovyAR',
    kicker: 'Cornell Makeathon · Feb 2026',
    award: '1st Place Overall',
    summary: 'An augmented-reality drum trainer that turns any song into timed, 4-lane percussion cues.',
    idea: 'Notes fall down four lanes and land on the drum pads right when you should hit them.',
    bullets: [
      'Preprocessed MP3s into timestamped beat events (librosa) and streamed cues over WebSockets.',
      'Anchored 3D drum guides with ArUco marker pose estimation and tracked drumsticks from camera data alone (OpenCV).',
      'Connected an Expo React Native app, a Flask backend, and a Raspberry Pi bridge end to end.',
    ],
    tags: ['Python', 'OpenCV', 'Flask', 'React Native', 'WebSockets', 'Raspberry Pi'],
    accent: '#EA4335',
    links: [
      { label: 'Watch demo', href: 'https://youtu.be/zjiVDPzzH5k' },
      { label: 'Code', href: 'https://github.com/Naijei1/GroovyAR' },
    ],
  },
  {
    id: 'downloader',
    name: 'Distributed Downloader',
    kicker: 'Cornell Data Science · Backend tech lead',
    summary: 'A LAN-first peer-to-peer downloader for game and software installs, built by a 7-person team.',
    idea: 'A file split into verified chunks streams in parallel from many peers, so no single server carries the load.',
    bullets: [
      'A tracker coordinates live peers while clients pull chunks from multiple machines in parallel over gRPC.',
      'Chunk-level integrity verification keeps transfers reliable over unstable peers.',
      'Designed orchestration for concurrent multi-peer retrieval to raise throughput.',
    ],
    tags: ['Java', 'Spring Boot', 'gRPC', 'Protobuf', 'P2P'],
    accent: '#4285F4',
    links: [
      { label: 'Project page', href: asset('downloader/') },
      { label: 'Code', href: 'https://github.com/CornellDataScience/distributed-downloader' },
    ],
  },
  {
    id: 'cluster',
    name: 'CDS Compute Cluster',
    kicker: 'Cornell Data Science · Systems',
    summary: 'Six networked nodes turned into shared compute for AI workloads, with a live health dashboard.',
    idea: 'Jobs queue up and Slurm drops them onto whichever node is free, while every node reports its health.',
    bullets: [
      'Configured Slurm workload scheduling and NFS shared storage for parallel training.',
      'Built a real-time dashboard for CPU/GPU usage and node status to catch failures early.',
    ],
    tags: ['Linux', 'Slurm', 'NFS', 'Docker', 'vLLM'],
    accent: '#34A853',
    links: [{ label: 'Code', href: 'https://github.com/CornellDataScience/computecluster' }],
  },
  {
    id: 'seeround',
    name: 'Seeround',
    kicker: 'Cornell Makeathon · 2025',
    award: 'Best Hardware Hack',
    summary: 'A wearable assistive device that helps visually impaired users navigate indoor spaces.',
    idea: 'The wearable scans the room and turns nearby obstacles into spatial audio you can hear.',
    bullets: [
      'Combined computer vision, distance sensing, and spatial audio on a Raspberry Pi.',
      'Prototyped as a hardware hack in a single weekend.',
    ],
    tags: ['Python', 'OpenCV', 'Raspberry Pi', 'Hardware'],
    accent: '#FBBC04',
    links: [
      { label: 'Watch demo', href: 'https://youtu.be/4V7Y8gmsLtg' },
      { label: 'Code', href: 'https://github.com/AuraHatlol/Seeround' },
    ],
  },
  {
    id: 'bioprint',
    name: 'VR Bioprinting',
    kicker: 'C-DIME × RIT · Research',
    summary:
      'An interactive VR bioprinting simulator for education research with the Rochester Institute of Technology.',
    idea: 'A print head lays down tissue layer by layer, the same process students practice in VR.',
    bullets: [
      'Led development of virtual interactions and 3D assets so students could explore bioprinting hands-on.',
      'Prototype tested by 20+ users for an education-effectiveness study.',
    ],
    tags: ['Unity', 'C#', 'Blender', 'VR'],
    accent: '#A142F4',
    links: [{ label: 'Code', href: 'https://github.com/Naijei1/VR-Bioprinting-Research-Project' }],
  },
]

export type MoreProject = { name: string; blurb: string; tags: string[]; href?: string; color: string }

export const moreProjects: MoreProject[] = [
  {
    name: 'Gnarly',
    blurb:
      'Indoor AR navigation: an iPhone LiDAR mapper, a web editor that links rooms and floors, and live AR guidance.',
    tags: ['Swift', 'ARKit', 'Unity', 'React', 'Firebase'],
    href: 'https://github.com/mukundgaur/gnarly',
    color: '#4285F4',
  },
  {
    name: 'Chinese Flashcards',
    blurb: 'A personal spaced-repetition PWA (FSRS-6) with Mandarin text-to-speech, writing drills, and CSV import.',
    tags: ['Next.js', 'TypeScript', 'DynamoDB'],
    href: 'https://github.com/Naijei1/FlashCardApp',
    color: '#EA4335',
  },
  {
    name: 'ML Final Web',
    blurb: 'A Streamlit app that predicts diabetes risk from health metrics with a scikit-learn model.',
    tags: ['Python', 'scikit-learn', 'Streamlit'],
    href: 'https://info1998-final.streamlit.app/',
    color: '#34A853',
  },
  {
    name: 'Cruisin VR',
    blurb: 'A VR driving game focused on vehicle handling and immersion.',
    tags: ['Unity', 'C#', 'VR'],
    href: 'https://github.com/Naijei1/Cruisin-VR',
    color: '#FBBC04',
  },
]

export const toolkit: { label: string; items: string[] }[] = [
  { label: 'Backend', items: ['Spring Boot', 'gRPC', 'Kafka', 'Flask', 'Node.js', 'PostgreSQL'] },
  { label: 'Languages', items: ['Java', 'Python', 'C', 'TypeScript', 'C#', 'OCaml', 'SQL'] },
  { label: 'Systems & infra', items: ['AWS', 'Terraform', 'Docker', 'Linux', 'Slurm', 'NFS'] },
  { label: 'Web, ML & XR', items: ['React', 'Next.js', 'OpenCV', 'scikit-learn', 'Unity', 'Blender'] },
]

export type Hobby = { emoji: string; title: string; text: string; href?: string; linkLabel?: string }

export const hobbies: Hobby[] = [
  { emoji: '🧗', title: 'Rock climbing', text: 'Bouldering is debugging with your whole body.' },
  { emoji: '🏃', title: 'Running', text: 'Long runs are where the best design ideas show up.' },
  {
    emoji: '🀄',
    title: 'Learning Chinese',
    text: 'Studying daily with a flashcard app I built for myself.',
    href: 'https://github.com/Naijei1/FlashCardApp',
    linkLabel: 'See the app',
  },
]
