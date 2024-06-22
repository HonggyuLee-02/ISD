document.addEventListener('DOMContentLoaded', function() {
    const dataUrl = 'http://127.0.0.1:7000/userInfo/';  // JSON 데이터를 가져올 API URL
    const loadButton = document.getElementById('load-button');
    const table = document.getElementById('data-table');
    const memberForm = document.getElementById('member-form');

    loadButton.addEventListener('click', function() {
        fetch(dataUrl)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector('#data-table tbody');
                tableBody.innerHTML = ''; // 테이블을 초기화합니다.

                data.forEach(item => {

                    const row = document.createElement('tr');

                    const numCell = document.createElement('td');
                    numCell.textContent = item.회원번호;
                    row.appendChild(numCell);
                    
                    const nameCell = document.createElement('td');
                    nameCell.textContent = item.회원이름;
                    row.appendChild(nameCell);
                    
                    const gradeCell = document.createElement('td');
                    gradeCell.textContent = item.등급;
                    row.appendChild(gradeCell);

                    const scoreCell = document.createElement('td');
                    scoreCell.textContent = item.이용점수;
                    row.appendChild(scoreCell);

                    const addressCell = document.createElement('td');
                    addressCell.textContent = item.회원주소;
                    row.appendChild(addressCell);

                    const discountCell = document.createElement('td');
                    discountCell.textContent = item.등급별할인율;
                    row.appendChild(discountCell);

                    tableBody.appendChild(row);
                });

                table.style.display = 'table'; // 테이블을 표시합니다.
            })
            .catch(error => {
               
                console.error('Error fetching the data:', error);
            });
    });

    memberForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const memberId = document.getElementById('memberId').value.trim();
        const memberName = document.getElementById('memberName').value.trim();

        // 입력값이 둘 다 없는 경우 경고
        if (!memberId && !memberName) {
            alert('회원번호 또는 회원이름을 입력해주세요.');
            return;
        }

        fetch(dataUrl)
            .then(response => response.json())
            .then(data => {
                const filteredMembers = data.filter(member => 
                    (memberId && member.회원번호 === memberId) || 
                    (memberName && member.회원이름 === memberName)
                );

                const tableBody = document.querySelector('#data-table tbody');
                tableBody.innerHTML = ''; // 테이블을 초기화합니다.

                if (filteredMembers.length > 0) {
                    filteredMembers.forEach(item => {
                        const row = document.createElement('tr');

                        const numCell = document.createElement('td');
                        numCell.textContent = item.회원번호;
                        row.appendChild(numCell);
                        
                        const nameCell = document.createElement('td');
                        nameCell.textContent = item.회원이름;
                        row.appendChild(nameCell);
                        
                        const gradeCell = document.createElement('td');
                        gradeCell.textContent = item.등급;
                        row.appendChild(gradeCell);

                        const scoreCell = document.createElement('td');
                        scoreCell.textContent = item.이용점수;
                        row.appendChild(scoreCell);

                        const addressCell = document.createElement('td');
                        addressCell.textContent = item.회원주소;
                        row.appendChild(addressCell);

                        const discountCell = document.createElement('td');
                        discountCell.textContent = item.등급별할인율;
                        row.appendChild(discountCell);

                        tableBody.appendChild(row);
                    });
                    table.style.display = 'table'; // 테이블을 표시합니다.
                } else {
                    alert('회원정보를 찾을 수 없습니다.');
                    table.style.display = 'none'; // 테이블을 숨깁니다.
                }
            })
            .catch(error => {
                console.error('Error fetching the data:', error);
            });
    });
});
