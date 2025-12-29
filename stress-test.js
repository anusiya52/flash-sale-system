const PRODUCT_ID = '676f00000000000000000001';
const NUM_REQUESTS = 50;
const API_URL = 'http://localhost:3000/api/purchase';

async function makePurchaseRequest(userId) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: `user_${userId}`,
        productId: PRODUCT_ID,
        quantity: 1,
      }),
    });

    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runStressTest() {
  console.log(`Starting stress test: ${NUM_REQUESTS} requests for 10 items`);
  console.log('----------------------------------------');

  const startTime = Date.now();

  const promises = Array.from({ length: NUM_REQUESTS }, (_, i) =>
    makePurchaseRequest(i + 1)
  );

  const results = await Promise.all(promises);

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  const endTime = Date.now();

  console.log(`Successful purchases: ${successful}`);
  console.log(`Failed (out of stock): ${failed}`);
  console.log(`Time taken: ${endTime - startTime}ms`);
  console.log('----------------------------------------');

  // Verify final stock
  try {
    const stockResponse = await fetch(
      `http://localhost:3000/api/products/${PRODUCT_ID}/stock`
    );
    const stockData = await stockResponse.json();

    console.log(`Final stock in database: ${stockData.stock}`);
    console.log('----------------------------------------');

    if (successful === 10 && failed === 40 && stockData.stock === 0) {
      console.log('TEST PASSED: No overselling detected');
    } else {
      console.log('TEST FAILED: Overselling detected or incorrect counts');
      console.log(`Expected: 10 successful, 40 failed, 0 stock`);
      console.log(`Got: ${successful} successful, ${failed} failed, ${stockData.stock} stock`);
    }
  } catch (error) {
    console.log('Failed to fetch final stock:', error.message);
  }
}

runStressTest().catch(console.error);