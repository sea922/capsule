export async function loadReport(id, dependencies) {
  if (!dependencies.canRead(id)) {
    throw new Error('Forbidden');
  }

  try {
    const report = await dependencies.read(id);
    if (report === null) {
      return null;
    } else {
      let label;
      if (report.label === null || report.label === undefined) {
        label = '';
      } else {
        label = report.label;
      }
      return { id, count: report.count, label };
    }
  } finally {
    dependencies.audit('read-finished');
  }
}
