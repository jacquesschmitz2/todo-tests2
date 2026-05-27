// Invoked by actions/github-script@v7.
// Required env vars: AI_RESPONSE, RUN_URL, DEDUP_LABEL, DEFAULT_LABELS (JSON array).
module.exports = async ({ github, context, core }) => {
  const raw = (process.env.AI_RESPONSE || '').trim();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    core.setFailed(`IA retornou JSON invalido: ${e.message}\nResposta: ${raw}`);
    return;
  }

  const dedupLabel = process.env.DEDUP_LABEL || 'qa-triage';
  let defaultLabels;
  try {
    defaultLabels = JSON.parse(process.env.DEFAULT_LABELS || '["qa-triage"]');
  } catch {
    defaultLabels = ['qa-triage'];
  }

  const runUrl = process.env.RUN_URL;
  const { owner, repo } = context.repo;

  const { data: existing } = await github.rest.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    labels: dedupLabel,
  });

  for (const issue of (parsed.issues || [])) {
    const fullTitle = `[QA Triage] ${issue.title}`;
    const dup = existing.find(e => e.title === fullTitle);

    if (dup) {
      core.info(`Atualizando issue existente #${dup.number}: ${fullTitle}`);
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: dup.number,
        body: `Nova ocorrencia desta falha: ${runUrl}`,
      });
    } else {
      core.info(`Criando nova issue: ${fullTitle}`);
      await github.rest.issues.create({
        owner,
        repo,
        title: fullTitle,
        body: `${issue.body}\n\n---\nRun: ${runUrl}\nCategoria: ${issue.category}\nSeveridade: ${issue.severity}`,
        labels: [...defaultLabels, `cat:${issue.category}`, `sev:${issue.severity}`],
      });
    }
  }
};
