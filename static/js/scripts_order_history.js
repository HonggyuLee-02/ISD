document.addEventListener('DOMContentLoaded', function () {
    const dataUrl = 'http://127.0.0.1:7000/order_historyInfo/'; // JSON 데이터를 가져올 API URL
    const loadButton = document.getElementById('load-button');
    const table = document.getElementById('data-table');

    loadButton.addEventListener('click', function () {
        fetch(dataUrl)
            .then((response) => response.json())
            .then((data) => {
                const tableBody = document.querySelector('#data-table tbody');
                tableBody.innerHTML = ''; // 테이블을 초기화합니다.

                data.forEach((item) => {
                    const row = document.createElement('tr');

                    const orderNumberCell = document.createElement('td');
                    orderNumberCell.textContent = item.주문번호;
                    row.appendChild(orderNumberCell);

                    const quantityCell = document.createElement('td');
                    quantityCell.textContent = item.구매수량;
                    row.appendChild(quantityCell);

                    const statusCell = document.createElement('td');
                    statusCell.textContent = item.처리상태;
                    row.appendChild(statusCell);

                    const gradeCell = document.createElement('td');
                    gradeCell.textContent = item.귤_등급;
                    row.appendChild(gradeCell);

                    const customerIdCell = document.createElement('td');
                    customerIdCell.textContent = item.고객_고객_id;
                    row.appendChild(customerIdCell);

                    const wrapIdCell = document.createElement('td');
                    wrapIdCell.textContent = item.포장_포장번호;
                    row.appendChild(wrapIdCell);

                    tableBody.appendChild(row);
                });

                table.style.display = 'table'; // 테이블을 표시합니다.
            })
            .catch((error) => {
                console.error('Error fetching the data:', error);
            });
    });
});
