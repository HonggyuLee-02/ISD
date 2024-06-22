document.addEventListener('DOMContentLoaded', () => {
    const packagingForm = document.getElementById('packaging-search-form');
    const assignForm = document.getElementById('assign-delivery-form');
    const statusForm = document.getElementById('delivery-status-form');

    packagingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const customerId = document.getElementById('customer-id').value;
        fetchPackagingByCustomerId(customerId);
    });

    assignForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const packagingId = document.getElementById('packaging-id').value;
        const driverName = document.getElementById('driver-name').value;
        assignDelivery(packagingId, driverName);
    });

    statusForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const packagingId = document.getElementById('status-packaging-id').value;
        checkDeliveryStatus(packagingId);
    });
});

async function fetchPackagingByCustomerId(customerId) {
    try {
        const response = await fetch(`http://localhost:7000/api/packaging/${customerId}`);
        const packaging = await response.json();
        displayPackaging(packaging);
    } catch (error) {
        alert(`포장 정보를 불러오는 데 실패했습니다: ${error.message}`);
    }
}

function displayPackaging(packaging) {
    const packagingResults = document.getElementById('packaging-results');
    packagingResults.innerHTML = '';  // Clear previous details

    if (!packaging || packaging.length === 0) {
        packagingResults.innerHTML = '<p>해당 고객의 포장 정보가 없습니다.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>포장 ID</th>
                <th>고객 ID</th>
                <th>포장된 아이템</th>
            </tr>
        </thead>
        <tbody>
            ${packaging.map(pack => `
                <tr>
                    <td>${pack.id}</td>
                    <td>${pack.customer_id}</td>
                    <td>${pack.packed_items}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    packagingResults.appendChild(table);
}

async function assignDelivery(packagingId, driverName) {
    try {
        const response = await fetch('http://localhost:7000/api/assign-delivery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ packaging_id: packagingId, driver_name: driverName })
        });

        if (response.ok) {
            alert('배송 기사가 할당되었습니다!');
        } else {
            const errorData = await response.json();
            alert(`할당 실패: ${errorData.message}`);
        }
    } catch (error) {
        alert(`배송 기사 할당에 실패했습니다: ${error.message}`);
    }
}

async function checkDeliveryStatus(packagingId) {
    try {
        const response = await fetch(`http://localhost:7000/api/delivery-status/${packagingId}`);
        const status = await response.json();
        displayDeliveryStatus(status);
    } catch (error) {
        alert(`배송 상태를 불러오는 데 실패했습니다: ${error.message}`);
    }
}

function displayDeliveryStatus(status) {
    const deliveryStatusDiv = document.getElementById('delivery-status');
    deliveryStatusDiv.innerHTML = '';  // Clear previous status

    if (!status) {
        deliveryStatusDiv.innerHTML = '<p>배송 상태를 찾을 수 없습니다.</p>';
        return;
    }

    deliveryStatusDiv.innerHTML = `
        <p>포장 ID: ${status.packaging_id}</p>
        <p>배송 기사: ${status.driver_name}</p>
        <p>배송 상태: ${status.delivery_status}</p>
    `;
}
