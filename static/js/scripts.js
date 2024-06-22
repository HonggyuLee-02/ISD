document.addEventListener('DOMContentLoaded', function () {
    const dataUrl = 'http://127.0.0.1:7000/mandarineInfo/'; // JSON 데이터를 가져올 API URL
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

                    const addressCell = document.createElement('td');
                    addressCell.textContent = item.등급;
                    row.appendChild(addressCell);

                    const discountCell = document.createElement('td');
                    discountCell.textContent = item.단가;
                    row.appendChild(discountCell);

                    const CountCell = document.createElement('td');
                    CountCell.textContent = item.수량;
                    row.appendChild(CountCell);

                    tableBody.appendChild(row);
                });

                table.style.display = 'table'; // 테이블을 표시합니다.
            })
            .catch((error) => {
                console.error('Error fetching the data:', error);
            });
    });
});
