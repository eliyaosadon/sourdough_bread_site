import { buildOrder, saveOrder } from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";

function fail(error: string, status = 400) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const limit = rateLimit(`orders:${clientIp(request)}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return fail("Too many orders from this connection. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.");
  }

  const result = buildOrder(body);
  if (!result.ok) return fail(result.error);

  await saveOrder(result.order);

  return Response.json(
    { orderId: result.order.id, totalAgorot: result.order.totalAgorot },
    { status: 201 },
  );
}
