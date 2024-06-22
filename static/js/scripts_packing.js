document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('order-search-form');
    const packButton = document.getElementById('pack-button');
    const packingForm = document.getElementById('packing-search-form');

    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const customerId = document.getElementById('customer-id').value;
        fetchOrdersByCustomerId(customerId);
    });

    packButton.addEventListener('click', async () => {
        const customerId = document.getElementById('customer-id').value;
        packOrders(customerId);
    });

    packingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const customerId = document.getElementById('packing-customer-id').value;
        fetchPackingByCustomerId(customerId);
    });
});

async function fetchOrdersByCustomerId(customerId) {
    try {
        const response = await fetch(`http://localhost:7000/api/orders/${customerId}`);
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        alert(`주문 정보를 불러오는 데 실패했습니다: ${error.message}`);
    }
}

function displayOrders(orders) {
    const orderResults = document.getElementById('order-results');
    orderResults.innerHTML = '';  // Clear previous results

    if (orders.length === 0) {
        orderResults.innerHTML = '<p>해당 고객의 주문이 없습니다.</p>';
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
                </tr>
            `).join('')}
        </tbody>
    `;
    orderResults.appendChild(table);
    document.getElementById('pack-button').style.display = 'block';
}

async function packOrders(customerId) {
    try {
        const response = await fetch(`http://localhost:7000/api/orders/${customerId}`);
        const orders = await response.json();

        const packedItems = orders.map(order => ({
            order_id: order.id,
            name: order.name,
            address: order.address,
            special_quantity: order.special_quantity,
            good_quantity: order.good_quantity,
            normal_quantity: order.normal_quantity
        }));

        const packResponse = await fetch('http://localhost:7000/api/pack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customer_id: customerId, packed_items: JSON.stringify(packedItems) })
        });

        if (packResponse.ok) {
            alert('주문이 포장되었습니다!');
            document.getElementById('order-results').innerHTML = '';
            document.getElementById('pack-button').style.display = 'none';
        } else {
            const errorData = await packResponse.json();
            alert(`포장 실패: ${errorData.message}`);
        }
    } catch (error) {
        alert(`포장하는 데 실패했습니다: ${error.message}`);
    }
}

async function fetchPackingByCustomerId(customerId) {
    try {
        const response = await fetch(`http://localhost:7000/api/packing/${customerId}`);
        const packing = await response.json();
        displayPacking(packing);
    } catch (error) {
        alert(`포장 정보를 불러오는 데 실패했습니다: ${error.message}`);
    }
}

function displayPacking(packing) {
    const packingResults = document.getElementById('packing-results');
    packingResults.innerHTML = '';  // Clear previous details

    if (!packing || !packing.packed_items) {
        packingResults.innerHTML = '<p>해당 고객의 포장 정보가 없습니다.</p>';
        return;
    }

    const packedItems = JSON.parse(packing.packed_items);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>주문 ID</th>
                <th>이름</th>
                <th>주소</th>
                <th>특등급 수량</th>
                <th>우수등급 수량</th>
                <th>보통등급 수량</th>
            </tr>
        </thead>
        <tbody>
            ${packedItems.map(item => `
                <tr>
                    <td>${item.order_id}</td>
                    <td>${item.name}</td>
                    <td>${item.address}</td>
                    <td>${item.special_quantity}</td>
                    <td>${item.good_quantity}</td>
                    <td>${item.normal_quantity}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    packingResults.appendChild(table);
}
