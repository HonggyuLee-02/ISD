document.addEventListener('DOMContentLoaded', function () {
    fetch('http://127.0.0.1:7000/packagingInfo/')
        .then((response) => response.json())
        .then((data) => {
            console.log('Fetched packaging info:', data); // 디버깅 출력
            const tableBody = document.getElementById('packaging-table-body');
            tableBody.innerHTML = '';
            data.forEach((item) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.포장번호}</td>
                    <td>미배정</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => console.error('Error fetching data:', error));

    document.getElementById('assign-button').addEventListener('click', function () {
        fetch('http://127.0.0.1:7000/assignDelivery/', {
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Assignment data:', data); // 디버깅 출력
                alert(data.message);
                location.reload();
            })
            .catch((error) => {
                console.error('Error assigning deliveries:', error);
                alert('Error assigning deliveries');
            });
    });
});
