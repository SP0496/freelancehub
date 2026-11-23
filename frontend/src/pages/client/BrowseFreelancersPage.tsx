import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Search, UserCheck, ShieldCheck, Mail } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'

interface TalentProfile {
  id: string
  name: string
  title: string
  domain: string
  skills: string[]
  hourlyRate: number
  verified: boolean
}

const TALENT_DIRECTORY: TalentProfile[] = [
  {
    id: 't-1',
    name: 'Alexandre Mercer',
    title: 'Senior Distributed Systems Architect',
    domain: 'Software Engineering',
    skills: ['Java', 'Spring Cloud', 'Kafka', 'PostgreSQL', 'Docker'],
    hourlyRate: 95,
    verified: true,
  },
  {
    id: 't-2',
    name: 'Elena Rostova',
    title: 'Principal Frontend Engineer',
    domain: 'Frontend Development',
    skills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Vite'],
    hourlyRate: 85,
    verified: true,
  },
  {
    id: 't-3',
    name: 'David Chen',
    title: 'Cloud Infrastructure & SRE Specialist',
    domain: 'DevOps & Cloud',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Prometheus'],
    hourlyRate: 110,
    verified: true,
  },
  {
    id: 't-4',
    name: 'Priya Sharma',
    title: 'Full-Stack Security & API Architect',
    domain: 'Software Engineering',
    skills: ['OAuth2', 'Keycloak', 'Node.js', 'Spring Boot', 'GraphQL'],
    hourlyRate: 90,
    verified: true,
  },
]

export const BrowseFreelancersPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('ALL')

  const filtered = TALENT_DIRECTORY.filter((t) => {
    const matchSearch =
      search.trim() === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))

    const matchDomain = selectedDomain === 'ALL' || t.domain === selectedDomain
    return matchSearch && matchDomain
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Talent Directory</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Discover Verified Freelancers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse vetted independent engineers and architects for direct invitations and proposal procurement.
          </p>
        </div>

        <Link to="/client/projects/new">
          <Button variant="secondary" size="sm">
            Post a Project Scope
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by specialty, name, or skill (e.g. Java, React, Cloud)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="ALL">All Domains</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Frontend Development">Frontend Development</option>
            <option value="DevOps & Cloud">DevOps & Cloud</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((talent) => (
            <div
              key={talent.id}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#172B4D] text-white flex items-center justify-center font-bold text-sm font-heading">
                      {talent.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{talent.name}</h3>
                        {talent.verified && (
                          <span title="Keycloak Verified">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{talent.title}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono text-slate-900">
                    ${talent.hourlyRate}/hr
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Verified Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
                <Link to="/client/projects/new" className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full justify-center">
                    Invite to Project
                  </Button>
                </Link>
                <Link to="/client/messages">
                  <Button size="sm" variant="outline" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                    Message
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No freelancers matching filters"
          description="Adjust your search criteria to explore all available independent specialists."
          actionLabel="Reset Search"
          onAction={() => {
            setSearch('')
            setSelectedDomain('ALL')
          }}
        />
      )}
    </div>
  )
}
