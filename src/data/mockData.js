export const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    company: "Nebula AI",
    location: "Remote",
    type: "Full-time",
    salary: "$140k - $180k",
    tags: ["React", "AI", "Node.js"],
    experience: "5-8 years",
    applyBy: "2026-02-15",
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Design Systems",
      "Performance",
      "Tailwind CSS",
    ],
    description:
      "Lead the frontend architecture for our AI productivity suite and mentor a small team shipping polished user experiences.",
    responsibilities: [
      "Partner with product and research to deliver fast iterations of AI-first web flows",
      "Own component quality, accessibility, and performance budgets",
      "Coach engineers through reviews and pair sessions to uplevel UI craft",
    ],
    requirements: [
      "5+ years with React and TypeScript in production",
      "Experience shaping or maintaining a design system",
      "Comfort collaborating with backend engineers on Node.js or Next.js",
    ],
    logo: "🌌",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    referrals: [
      {
        name: "Sarah Chen",
        role: "Product Manager",
        img: "https://i.pravatar.cc/150?u=sarah",
      },
      {
        name: "Mike Ross",
        role: "Senior Dev",
        img: "https://i.pravatar.cc/150?u=mike",
      },
    ],
  },
  {
    id: "job-2",
    title: "AI Research Scientist",
    company: "Quantum Leap",
    location: "San Francisco, CA",
    type: "On-site",
    salary: "$200k - $300k",
    tags: ["Python", "PyTorch", "Research"],
    experience: "3-6 years",
    applyBy: "2026-03-01",
    skills: [
      "Python",
      "PyTorch",
      "Experimentation",
      "LLM Fine-tuning",
      "Data Engineering",
    ],
    description:
      "Design novel model architectures and experiments that move our applied research roadmap forward.",
    responsibilities: [
      "Prototype and benchmark new model ideas across latency and quality goals",
      "Collaborate with product to translate research into deployable features",
      "Publish findings internally and mentor junior researchers",
    ],
    requirements: [
      "Strong Python and deep learning fundamentals",
      "Hands-on with PyTorch or JAX for large-scale training",
      "Experience shipping research into production systems",
    ],
    logo: "⚛️",
    color: "bg-cyan-50 text-cyan-600 border-cyan-100",
    referrals: [],
  },
  {
    id: "job-3",
    title: "UX/UI Designer",
    company: "Glass & Co",
    location: "New York, NY",
    type: "Hybrid",
    salary: "$110k - $150k",
    tags: ["Figma", "Design Systems"],
    experience: "4-6 years",
    applyBy: "2026-02-05",
    skills: [
      "Figma",
      "Design Systems",
      "User Research",
      "Prototyping",
      "Motion",
    ],
    description:
      "Shape cohesive experiences across consumer and enterprise surfaces with a design system mindset.",
    responsibilities: [
      "Run discovery workshops and translate insights into clear flows",
      "Maintain and evolve our design system with accessible components",
      "Pair closely with engineering to ensure fidelity and performance",
    ],
    requirements: [
      "Portfolio demonstrating shipped end-to-end product work",
      "Expert Figma skills with component libraries",
      "Comfort testing concepts with users and iterating quickly",
    ],
    logo: "🎨",
    color: "bg-pink-50 text-pink-600 border-pink-100",
    referrals: [
      {
        name: "Jessica Day",
        role: "Head of Design",
        img: "https://i.pravatar.cc/150?u=jessica",
      },
    ],
  },
  {
    id: "job-4",
    title: "Backend Systems Engineer",
    company: "Cyberdyne",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$130k - $170k",
    tags: ["Go", "Kubernetes"],
    experience: "5-9 years",
    applyBy: "2026-02-28",
    skills: ["Go", "Kubernetes", "Distributed Systems", "gRPC", "PostgreSQL"],
    description:
      "Build and scale resilient services that power critical automation workflows across edge devices.",
    responsibilities: [
      "Design APIs and services with SLOs for latency and availability",
      "Harden CI/CD pipelines and observability for high-uptime systems",
      "Collaborate with security to ship compliant releases",
    ],
    requirements: [
      "Strong Go engineering experience with production services",
      "Comfort operating Kubernetes in cloud environments",
      "Knowledge of distributed systems patterns and data stores",
    ],
    logo: "🤖",
    color: "bg-slate-50 text-slate-600 border-slate-100",
    referrals: [],
  },
];

export const MOCK_RESUMES = [
  {
    id: "res-1",
    name: "Software Engineer Resume",
    score: 92,
    lastUpdated: "2 days ago",
    version: "v4.2",
  },
  {
    id: "res-2",
    name: "Product Manager Variation",
    score: 78,
    lastUpdated: "1 week ago",
    version: "v1.1",
  },
];

export const MOCK_APPLICATIONS = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Senior Frontend Engineer",
    company: "Nebula AI",
    status: "Interviewing",
    date: new Date().toISOString(),
    logo: "🌌",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
];
