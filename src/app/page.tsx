import Link from 'next/link';
import { Clock, Shield, CheckCircle2, Zap, ArrowRight, Users, FileText, CreditCard, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIvPjxwYXRoIGQ9Ik00MCAwdjQwSDQwVjB6TTAgMHY0MEgxVjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIi8+PHBhdGggZD0iTTAgMGg0MHYxSDAtMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Chrona</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">Now in Beta — Built for the Future of Work</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                The Truth Layer for
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Freelance Work
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track time, log deliverables, and get approvals — all in one place. 
              Chrona creates transparent records that make freelance collaboration seamless.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group flex items-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:scale-105"
              >
                Start Tracking Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="flex items-center gap-2 px-8 py-4 text-base font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all hover:bg-white/5"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-5xl">
              {/* Browser Chrome */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-slate-800/50 rounded-lg text-xs text-slate-500">
                      app.chrona.io/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard Preview */}
                <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Hours This Week', value: '32.5h', color: 'from-indigo-500 to-violet-500' },
                      { label: 'Pending Review', value: '2', color: 'from-amber-500 to-orange-500' },
                      { label: 'Approved', value: '8', color: 'from-emerald-500 to-teal-500' },
                      { label: 'Team Members', value: '5', color: 'from-blue-500 to-cyan-500' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                        <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 p-4 bg-slate-800/30 rounded-xl border border-white/5 h-48">
                      <p className="text-sm text-slate-400 mb-3">Recent Timesheets</p>
                      <div className="space-y-2">
                        {['Sarah Chen • Week of Jan 13', 'Alex Rivera • Week of Jan 13', 'Jordan Lee • Week of Jan 6'].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                            <span className="text-sm text-slate-300">{item}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {i === 0 ? 'Pending' : 'Approved'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5 h-48">
                      <p className="text-sm text-slate-400 mb-3">Quick Actions</p>
                      <div className="space-y-2">
                        <div className="p-3 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 rounded-lg border border-indigo-500/20 text-center">
                          <p className="text-sm font-medium text-indigo-300">+ Log Time</p>
                        </div>
                        <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                          <p className="text-sm text-slate-400">View Projects</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Trust the Work
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From time tracking to approvals, Chrona provides a complete audit trail 
              for freelance work — ready for the future of programmable payments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Time Tracking',
                description: 'Log hours against projects with descriptions and deliverable links. Never lose track of your work again.',
                gradient: 'from-indigo-500 to-violet-500',
              },
              {
                icon: FileText,
                title: 'Weekly Timesheets',
                description: 'Submit weekly timesheets with summaries. Organize your work into reviewable, approvable chunks.',
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                icon: CheckCircle2,
                title: 'Approval Workflow',
                description: 'Admins review, comment, and approve timesheets. Clear communication, zero ambiguity.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                icon: Users,
                title: 'Team Management',
                description: 'Assign freelancers to projects. Control who works on what with simple member management.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Shield,
                title: 'Immutable Records',
                description: 'Every action is tracked with timestamps. Create transparent, auditable work histories.',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                icon: CreditCard,
                title: 'Payment Ready',
                description: 'Designed for programmable payments. When work is approved, payment logic can trigger automatically.',
                gradient: 'from-pink-500 to-rose-500',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:bg-slate-900/70"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple by Design
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Three steps to transparent, approved work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Log Your Work',
                description: 'Track time against assigned projects. Add descriptions and link to deliverables.',
              },
              {
                step: '02',
                title: 'Submit Timesheet',
                description: 'At the end of each week, submit your timesheet with a summary of what you delivered.',
              },
              {
                step: '03',
                title: 'Get Approved',
                description: 'Admins review and approve your work. Clear records for everyone.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-indigo-500/50 to-transparent" style={{ width: 'calc(100% - 3rem)' }} />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold mb-6 shadow-lg shadow-indigo-500/30">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-900/50 via-violet-900/30 to-purple-900/50 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            <div className="relative">
              <Zap className="w-12 h-12 mx-auto mb-6 text-amber-400" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Track Smarter?
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                Join the beta and be first to experience transparent freelance work management. 
                Free during beta, built for scale.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-xl transition-all hover:scale-105"
              >
                Create Free Account
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Chrona</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 Chrona. The truth layer for freelance work.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
