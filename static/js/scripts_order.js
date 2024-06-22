document.addEventListener('DOMContentLoaded', function () {
    const dataUrl = 'http://127.0.0.1:7000/mandarineSortedInfo/'; // JSON 데이터를 가져올 API URL
    fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = ''; // 테이블을 초기화합니다.

            Object.entries(data).forEach(([key, value]) => {
                const row = document.createElement('tr');

                const gradeCell = document.createElement('td');
                gradeCell.textContent = key; // 등급
                row.appendChild(gradeCell);

                const stockCell = document.createElement('td');
                stockCell.textContent = value['수량'] + '개'; // 재고량
                row.appendChild(stockCell);

                const priceCell = document.createElement('td');
                priceCell.textContent = value['단가'] + '원'; // 가격
                row.appendChild(priceCell);

                const quantityCell = document.createElement('td');

                const select = document.createElement('select');
                select.name = `quantity_${key}`; // 각 등급별로 구분된 이름을 가짐
                select.className = 'form-control';

                // 드롭다운 메뉴에 수량 옵션 추가 (1부터 재고량까지)
                for (let i = 1; i <= parseInt(value['수량']); i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    select.appendChild(option);
                }

                const gradeInput = document.createElement('input');
                gradeInput.type = 'hidden';
                gradeInput.name = `grade_${key}`;
                gradeInput.value = key;

                quantityCell.appendChild(select);
                quantityCell.appendChild(gradeInput);
                row.appendChild(quantityCell);

                tableBody.appendChild(row);
            });

            document.getElementById('data-table').style.display = 'table'; // 테이블을 표시합니다.
        })
        .catch((error) => {
            console.error('Error fetching the data:', error);
        });
});
