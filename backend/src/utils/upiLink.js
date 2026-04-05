/**
 * UPI deep link per NPCI-style params: pa, pn, am, tn
 */
function buildUpiPayUri({ pa, pn, am, tn }) {
  const params = new URLSearchParams({
    pa: pa || '',
    pn: pn || '',
    am: String(am ?? ''),
    tn: tn || '',
  });
  return `upi://pay?${params.toString()}`;
}

module.exports = { buildUpiPayUri };
