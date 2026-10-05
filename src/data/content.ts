export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const profile = {
  name: 'Naijei Jiang',
  firstName: 'Naijei',
  role: 'Backend & systems engineer',
  tagline:
    'I build backend services and the systems underneath them: Kafka infrastructure at GEICO, a peer-to-peer downloader at Cornell, and the occasional AR drum kit.',
  intro:
    'Backend first, systems all the way down. I like APIs, data pipelines, schedulers, and networks, and making them fast and reliable.',
  photo: asset('naijei.webp'),
  location: 'Ithaca & Rochester, NY',
  email: 'nj277@cornell.edu',
  now: ['Leading FTM Snake, a distributed snake game', 'TA for CS 2110', 'Tech lead @ Cornell Data Science'],
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
    role: 'Software Engineer Intern',
    period: 'Jun 2026 – Aug 2026',
    place: 'New York, NY',
    bullets: [
      'Automated versioned Kafka schema registration in Apicurio Registry with Terraform.',
      'Built a claim-adjuster AI agent that books, looks up, and cancels rental reservations through service APIs.',
      'Built an AI documentation skill tracing salvage-event schemas across Kafka topics for the Guidewire-to-microservices migration.',
    ],
    tags: ['Backend', 'Kafka', 'Terraform', 'AI Agents'],
  },
  {
    org: 'Cornell Data Science',
    role: 'Technical Lead',
    period: 'Sep 2025 – Present',
    place: 'Ithaca, NY',
    current: true,
    bullets: [
      'Run AWS model-training infrastructure for 6 teams: compute budgets, IAM access, and parallel job scheduling.',
      'Taught computer vision and distributed training to 30+ students in workshops and an INFO 1998 guest lecture.',
    ],
    tags: ['Backend', 'AWS', 'Distributed Training', 'Teaching'],
  },
  {
    org: 'Cornell Bowers CIS',
    role: 'Teaching Assistant · CS 2110 Data Structures & Algorithms',
    period: 'Aug 2025 – Present',
    place: 'Ithaca, NY',
    current: true,
    bullets: [
      'Lead weekly sections for 34 students in a 300+ student Java course: data structures, graphs, concurrency, and GUIs.',
      'Cut course-website load time from ~10 s to under 1 s by pre-rendering dynamic SVGs.',
    ],
    tags: ['Java', 'Algorithms', 'Teaching', 'Performance'],
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
    summary: 'A hands-free AR drum trainer that turns songs into synced, four-lane percussion cues for smart glasses.',
    idea: 'Notes fall down four lanes and land on the drum pads right when you should hit them.',
    bullets: [
      'Won 1st place overall among 150+ participants at Cornell Makeathon.',
      'Built a Flask audio pipeline that turns MP3s into timestamped beats (Librosa) and streams low-latency cues over WebSockets.',
      'Anchored the cue overlay to the drum kit with ArUco markers in a React front end.',
    ],
    tags: ['Python', 'Flask', 'React', 'OpenCV', 'Librosa', 'Raspberry Pi'],
    accent: '#EA4335',
    links: [
      { label: 'Watch demo', href: 'https://youtu.be/zjiVDPzzH5k' },
      { label: 'Code', href: 'https://github.com/Naijei1/GroovyAR' },
    ],
  },
  {
    id: 'downloader',
    name: 'Distributed Downloader',
    kicker: 'Cornell Data Science · Team lead · Jan–May 2026',
    summary:
      'A peer-to-peer file distribution system testing whether multi-peer chunk transfers beat single-source downloads.',
    idea: 'A file split into chunks streams in parallel from many peers, so no single server carries the load.',
    bullets: [
      'Led a 6-person team building it in Java with Spring Boot and gRPC.',
      'Designed a central tracker with heartbeat liveness checks and stale-peer eviction for file discovery.',
      'Measured 2.3× faster downloads from multiple peers versus one (~23 MB/s); profiled gRPC serialization as the next bottleneck.',
    ],
    tags: ['Java', 'Spring Boot', 'gRPC', 'Protobuf', 'Maven'],
    accent: '#4285F4',
    links: [
      { label: 'Project page', href: asset('downloader/') },
      { label: 'Code', href: 'https://github.com/CornellDataScience/distributed-downloader' },
    ],
  },
  {
    id: 'cluster',
    name: 'HPC Compute Cluster',
    kicker: 'Cornell Data Science · Sep–Dec 2025',
    summary: 'A 6-node cluster built from refurbished computers to test a cheaper alternative to AWS for AI workloads.',
    idea: 'Jobs queue up and Slurm drops them onto whichever node is free, while every node reports its health.',
    bullets: [
      'Configured Slurm scheduling and NFS storage for parallel AI workloads.',
      'Built a real-time CPU/GPU and node-health dashboard that surfaced 4 power-related outages.',
    ],
    tags: ['Slurm', 'NFS', 'Linux', 'Cloudflare', 'vLLM'],
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

export type MoreProject = {
  name: string
  blurb: string
  tags: string[]
  href?: string
  color: string
  status?: string
}

export const moreProjects: MoreProject[] = [
  {
    name: 'FTM Snake',
    status: 'In progress',
    blurb: 'Leading a Cornell Data Science team building a distributed, multiplayer snake game in Rust.',
    tags: ['Rust', 'macroquad', 'Distributed Systems'],
    href: 'https://github.com/CornellDataScience/FTM-Snake',
    color: '#34A853',
  },
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
  { label: 'Backend', items: ['Spring Boot', 'gRPC', 'Protocol Buffers', 'REST APIs', 'Flask', 'Kafka'] },
  { label: 'Languages', items: ['Python', 'Java', 'C', 'C#', 'JavaScript', 'TypeScript', 'OCaml', 'SQL'] },
  { label: 'Systems & infra', items: ['AWS', 'Terraform', 'Docker', 'Linux', 'Slurm', 'Azure DevOps'] },
  { label: 'Data, web & ML', items: ['PostgreSQL', 'MongoDB', 'React', 'OpenCV', 'Librosa'] },
]

export type Hobby = { emoji: string; title: string; text: string; href?: string; linkLabel?: string }

export const hobbies: Hobby[] = [
  { emoji: '🧗', title: 'Rock climbing', text: 'Top of my interests list outside of computer science.' },
  {
    emoji: '🏃',
    title: 'Running',
    text: 'My Apple Watch logs every run. Hit “I’m Feeling Lucky” up top to see today’s stats.',
  },
  {
    emoji: '🀄',
    title: 'Learning Chinese',
    text: 'Working toward 77 new words a week with a spaced-repetition flashcard app I built.',
    href: 'https://github.com/Naijei1/FlashCardApp',
    linkLabel: 'See the app',
  },
  {
    emoji: '🧑‍🏫',
    title: 'Teaching',
    text: 'TA for CS 2110, plus CDS workshops and an INFO 1998 guest lecture on computer vision and distributed training.',
  },
]
