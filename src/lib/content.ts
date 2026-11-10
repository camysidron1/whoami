export interface Project {
	id: string;
	org: string;
	when: string;
	title: string;
	problem: string;
	built: string;
	result: string;
	stack: string[];
}

export interface Role {
	when: string;
	org: string;
	title: string;
	note: string;
}

export const projects: Project[] = [
	{
		id: 'finding-to-fix',
		org: 'Pi Security',
		when: '2025 to now',
		title: 'Finding-to-fix agents',
		problem:
			'Security teams receive findings faster than they can fix them. Each one needs triage, a root cause, a search for the same bug elsewhere, and a fix someone can trust.',
		built:
			'I lead the agentic workflow layer: triage, root-cause analysis, variant hunting, remediation and attack surface scanning, all running as long-lived workflows in production.',
		result: 'A raw finding becomes a validated fix in under an hour.',
		stack: ['Python', 'TypeScript', 'Temporal', 'LLM agents', 'Postgres']
	},
	{
		id: 'sca',
		org: 'Pi Security',
		when: '2026',
		title: 'Dependency scanning, built from scratch',
		problem: 'Most dependency scanners stop at the alert, so the alerts pile up.',
		built:
			'I built the software composition analysis product from zero. It inventories a codebase’s dependencies, matches them against advisories, and checks whether the vulnerable code is reachable. Customers set their own remediation policy from conditions and actions: severity, reachability, upgrade safety, auto-fix.',
		result: 'The product opens a pull request with the fix.',
		stack: ['Python', 'Temporal', 'SBOM', 'Next.js', 'Redis']
	},
	{
		id: 'pr-review',
		org: 'Pi Security',
		when: 'patent pending',
		title: 'Agentic PR review',
		problem:
			'Security review at merge time is slow, and generic review bots ignore a team’s own policies.',
		built:
			'Contributor to a patent-pending review system: policy-aware reviews, inline comments on the code host, and human approval before merge.',
		result: 'Security feedback lands in the pull request, where engineers already work.',
		stack: ['LLM agents', 'GitHub', 'GitLab', 'Bitbucket']
	},
	{
		id: 'agent-tracing',
		org: 'Pi Security',
		when: '2026',
		title: 'Tracing for long-running agents',
		problem:
			'When an agent workflow fails an hour in, you need to know whether the model, a tool, or the prompt broke.',
		built:
			'I deployed the Grafana stack (Loki, Tempo, Mimir) to trace agent workflows and Temporal workers in production.',
		result: 'Model, tool and prompt failures can be told apart.',
		stack: ['Grafana', 'Tempo', 'Loki', 'Mimir', 'Terraform', 'Kubernetes']
	},
	{
		id: 'ops-agents',
		org: 'Pi Security',
		when: '2026',
		title: 'Ops agents with a human in the loop',
		problem: 'On-call questions about production take an engineer away from their work.',
		built:
			'Agents triggered from Slack that run as on-demand Kubernetes jobs. They read production through a read-only monitoring server and take live actions only after a person approves in Slack.',
		result:
			'Routine investigations start themselves, and nothing changes in production without a yes.',
		stack: ['Kubernetes', 'MCP', 'Slack', 'Temporal']
	},
	{
		id: 'submission-intake',
		org: 'Shepherd',
		when: '2024 to 2025',
		title: 'Broker submission intake',
		problem:
			'Insurance brokers send submissions as emails and attachments, and someone had to key each one in.',
		built:
			'An enterprise connector that parses inbound emails and attachments, extracts the key fields with LLM APIs, and creates the submission in the platform.',
		result: 'Submissions arrive with no manual entry.',
		stack: ['TypeScript', 'SST', 'AWS', 'LLM APIs']
	},
	{
		id: 'nl-analytics',
		org: 'Patterns',
		when: '2024',
		title: 'Ask your data in plain English',
		problem: 'Business users waited on analysts to answer questions about their own operations.',
		built:
			'A natural-language analytics platform over customers’ operational data, plus an AI invoice reconciliation engine that flags disputable invoices.',
		result: 'Reconciliation raised one customer’s monthly gross revenue by 10%.',
		stack: ['Django', 'Next.js', 'Retrieval', 'Prompt engineering']
	},
	{
		id: 'fleet-monitor',
		org: 'Zoox',
		when: '2023 to 2024',
		title: 'Robotaxi fleet monitoring',
		problem: 'Scaling a robotaxi service means each support operator has to watch more vehicles.',
		built:
			'A real-time fleet monitoring tool that operators use daily, with a vehicle alerting system and a task router on Twilio.',
		result: 'One operator went from monitoring 1 vehicle to 6.',
		stack: ['Node', 'React', 'Twilio']
	},
	{
		id: 'upstream',
		org: 'Side project',
		when: '2023 to 2024',
		title: 'Upstream',
		problem:
			'In a hardware project, the 3D model, the drawings and the requirements live in separate places and drift apart.',
		built:
			'Upstream turns a plain-English description into a parametric 3D CAD model, using a custom data model and text-to-SQL. The model, the drawings and the captured project requirements are one connected system.',
		result:
			'A change to the underlying model propagates to the drawings and is cross-checked against the requirements.',
		stack: ['Text-to-SQL', 'CAD', 'LLM APIs']
	}
];

export const roles: Role[] = [
	{
		when: '2025-06 to now',
		org: 'Pi Security',
		title: 'Founding Engineer',
		note: 'Second engineering hire at an application security startup.'
	},
	{
		when: '2024-12 to 2025-05',
		org: 'Shepherd',
		title: 'Software Engineer',
		note: 'LLM intake and pricing for commercial insurance.'
	},
	{
		when: '2024-04 to 2024-12',
		org: 'Patterns',
		title: 'Lead Software Engineer',
		note: 'Natural-language analytics and invoice reconciliation.'
	},
	{
		when: '2023-04 to 2024-04',
		org: 'Zoox',
		title: 'Software Engineer',
		note: 'Fleet monitoring, alerting and task routing.'
	},
	{
		when: '2022-01 to 2023-04',
		org: 'Zoox',
		title: 'Technical Program Manager',
		note: 'Roadmap for an eight-engineer in-vehicle software team.'
	},
	{
		when: '2021-04 to 2022-01',
		org: 'Propeller',
		title: 'Technical Program Manager',
		note: 'Technology programs from kickoff to delivery.'
	}
];
