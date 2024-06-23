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
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                const select = document.createElement('select');
                select.name = `quantity_${key}`; // 각 등급별로 구분된 이름을 가짐
                select.className = 'form-control';

                // 수량 확인용 콘솔 로그 추가
                console.log(`등급: ${key}, 수량: ${value['수량']}`);

                // 드롭다운 메뉴에 수량 옵션 추가 (0부터 재고량까지)
                const stockQuantity = parseInt(value['수량']);
                if (!isNaN(stockQuantity)) {
                    for (let i = 0; i <= stockQuantity; i++) {
                        // 수정된 부분: i = 0 부터 시작
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = i;
                        select.appendChild(option);
                    }
                } else {
                    console.error(`Invalid stock quantity for grade ${key}: ${value['수량']}`);
                }

                const gradeInput = document.createElement('input');
                gradeInput.type = 'hidden';
                gradeInput.name = `grade_${key}`;
                gradeInput.value = key;

                formGroup.appendChild(select);
                formGroup.appendChild(gradeInput);
                quantityCell.appendChild(formGroup);
                row.appendChild(quantityCell);

                tableBody.appendChild(row);
            });

            document.getElementById('data-table').style.display = 'table'; // 테이블을 표시합니다.
        })
        .catch((error) => {
            console.error('Error fetching the data:', error);
        });
});
