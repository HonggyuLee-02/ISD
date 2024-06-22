document.addEventListener('DOMContentLoaded', () => {
    const orderHistoryForm = document.getElementById('order-history-form');

    orderHistoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const customerId = document.getElementById('customer-id').value;
        fetchOrderHistoryByCustomerId(customerId);
    });
});

async function fetchOrderHistoryByCustomerId(customerId) {
    try {
        const response = await fetch(`http://localhost:7000/api/order-history/${customerId}`);
        const orders = await response.json();
        displayOrderHistory(orders);
    } catch (error) {
        alert(`주문 내역을 불러오는 데 실패했습니다: ${error.message}`);
    }
}

function displayOrderHistory(orders) {
    const orderHistoryResults = document.getElementById('order-history-results');
    orderHistoryResults.innerHTML = '';  // Clear previous results

    if (orders.length === 0) {
        orderHistoryResults.innerHTML = '<p>해당 고객의 주문 내역이 없습니다.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>주문 ID</th>
                <th>고객 ID</th>
                <th>이름</th>
                <th>주소</th>
                <th>특등급 수량</th>
                <th>우수등급 수량</th>
                <th>보통등급 수량</th>
                <th>총 주문 금액</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer_id}</td>
                    <td>${order.name}</td>
                    <td>${order.address}</td>
                    <td>${order.special_quantity}</td>
                    <td>${order.good_quantity}</td>
                    <td>${order.normal_quantity}</td>
                    <td>${calculateOrderAmount(order)}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    orderHistoryResults.appendChild(table);

    const totalAmount = orders.reduce((sum, order) => sum + calculateOrderAmount(order), 0);
    const totalOrderAmountDiv = document.getElementById('total-order-amount');
    totalOrderAmountDiv.innerHTML = `<h3>총 주문 금액: ${totalAmount}원</h3>`;
}

function calculateOrderAmount(order) {
    const specialPrice = 10000;  // 특등급 단가
    const goodPrice = 7000;      // 우수등급 단가
    const normalPrice = 5000;    // 보통등급 단가

    return (order.special_quantity * specialPrice) +
           (order.good_quantity * goodPrice) +
           (order.normal_quantity * normalPrice);
}
