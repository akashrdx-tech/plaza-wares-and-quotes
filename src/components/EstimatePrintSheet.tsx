import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { formatQty, lineAmount, type BillLine, type BillMeta } from "@/lib/estimate-store";
import { formatPKR } from "@/lib/stock-types";

type Props = {
  meta: BillMeta;
  lines: BillLine[];
  subtotal: number;
  discount: number;
  discountLabel: string;
  total: number;
  received: number;
  balance: number;
};

/**
 * B5 printable estimate. Rendered straight into <body> so that, when printing,
 * every other body child (site chrome, floating buttons, hosting badges) can be hidden.
 * Outer table thead/tfoot act as repeating top/bottom page margins, which lets
 * @page use margin 0 (removes the browser's own URL/date header and footer).
 */
export function EstimatePrintSheet(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<Sheet {...props} />, document.body);
}

function Sheet({
  meta,
  lines,
  subtotal,
  discount,
  discountLabel,
  total,
  received,
  balance,
}: Props) {
  const totalQty = lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0);
  const showUnit = lines.some((line) => Boolean(line.unit));

  return (
    <div className="print-sheet" aria-hidden="true">
      <table className="ps-frame">
        <thead>
          <tr>
            <td className="ps-gap-top" />
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td className="ps-gap-bottom" />
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td>
              <header className="ps-head">
                <div className="ps-brand">
                  <img src="/logo-plaza.png" alt="" className="ps-logo" />
                  <div>
                    <p className="ps-shop">PLAZA STEEL &amp; CROCKERY</p>
                    <p className="ps-shop-line">Steel · Crockery · Cookware · Home Appliances</p>
                    <p className="ps-shop-line">WhatsApp: +92 546501637</p>
                  </div>
                </div>
                <table className="ps-meta">
                  <tbody>
                    <tr>
                      <th>Bill No.</th>
                      <td className="ps-bill-no">{meta.billNo || "—"}</td>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <td>{meta.date || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </header>

              <section className="ps-customer">
                <div className="ps-cust-main">
                  <span className="ps-label">Customer</span>
                  <span className="ps-customer-name">
                    {meta.customerName || "____________________"}
                  </span>
                </div>
                <div className="ps-cust-row">
                  <span>
                    <span className="ps-label">Phone</span> {meta.customerPhone || "—"}
                  </span>
                  <span className="ps-cust-addr">
                    <span className="ps-label">Address</span> {meta.customerAddress || "—"}
                  </span>
                </div>
              </section>

              <table className="ps-items">
                <thead>
                  <tr>
                    <th className="c-no">#</th>
                    <th className="c-item">Description</th>
                    <th className="c-qty">Qty</th>
                    {showUnit ? <th className="c-unit">Unit</th> : null}
                    <th className="c-rate">Rate</th>
                    <th className="c-amt">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line.id}>
                      <td className="c-no">{index + 1}</td>
                      <td className="c-item">
                        <span className="ps-item-name">{line.name}</span>
                        {line.code ? <span className="ps-code"> {line.code}</span> : null}
                      </td>
                      <td className="c-qty">{formatQty(line.qty)}</td>
                      {showUnit ? <td className="c-unit">{line.unit || ""}</td> : null}
                      <td className="c-rate">{formatPKR(line.unitPrice)}</td>
                      <td className="c-amt">{formatPKR(lineAmount(line.qty, line.unitPrice))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ps-end">
                <div className="ps-bottom">
                  <div className="ps-left">
                    <div className="ps-counts">
                      <span>
                        Items <b>{lines.length}</b>
                      </span>
                      <span>
                        Total Qty <b>{formatQty(totalQty)}</b>
                      </span>
                    </div>
                    {meta.notes ? (
                      <p className="ps-notes">
                        <b>Note:</b> {meta.notes}
                      </p>
                    ) : null}
                  </div>
                  <table className="ps-totals">
                    <tbody>
                      <tr>
                        <th>Subtotal</th>
                        <td>{formatPKR(subtotal)}</td>
                      </tr>
                      {discount > 0 ? (
                        <tr>
                          <th>{discountLabel}</th>
                          <td>- {formatPKR(discount)}</td>
                        </tr>
                      ) : null}
                      <tr className="ps-grand">
                        <th>Net Total</th>
                        <td>Rs {formatPKR(total)}</td>
                      </tr>
                      {received > 0 ? (
                        <>
                          <tr>
                            <th>Received</th>
                            <td>{formatPKR(received)}</td>
                          </tr>
                          <tr className="ps-balance">
                            <th>Balance</th>
                            <td>Rs {formatPKR(balance)}</td>
                          </tr>
                        </>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <div className="ps-sign">
                  <div>
                    <span />
                    Prepared By
                  </div>
                  <div>
                    <span />
                    Checked By
                  </div>
                  <div>
                    <span />
                    Customer Signature
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
