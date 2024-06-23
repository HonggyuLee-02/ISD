from fastapi import FastAPI, HTTPException, Query, Form
from fastapi.templating import Jinja2Templates
from fastapi import Request
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

from fastapi.staticfiles import StaticFiles

templates = Jinja2Templates(directory="templates")

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html",{"request":request})

@app.get("/search/")
async def home(request: Request):
    return templates.TemplateResponse("search.html",{"request":request})

@app.get("/order/")
async def home(request: Request):
    return templates.TemplateResponse("order.html",{"request":request})

@app.get("/order_history/")
async def home(request: Request):
    return templates.TemplateResponse("order_history.html",{"request":request})

@app.get("/orderlist/")
async def home(request: Request):
    return templates.TemplateResponse("order_history.html",{"request":request})

@app.get("/insert/")
async def home(request: Request):
    return templates.TemplateResponse("insert.html",{"request":request})

@app.get("/totalPriceSearch/")
async def home(request: Request):
    return templates.TemplateResponse("totalPriceSearch.html",{"request":request})

import pymysql

conn = pymysql.connect(host="127.0.0.1", user="root", password="root", 
                        db='sql_project', charset="utf8", cursorclass=pymysql.cursors.DictCursor)
cur = conn.cursor()

@app.get("/mandarineInfo/")
def get_mandarine_by_id():
    try:
        sql = "SELECT * FROM 귤"
        cur.execute(sql)
        row = cur.fetchall()
        conn.commit()  # 커밋을 통해 변경 사항을 반영합니다.
        print(row)  # 디버깅용 출력
        if not row:
            raise HTTPException(status_code=404, detail="No data found")
        return row
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # 에러 발생 시 롤백합니다.
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/insert_info/")
def insert_info(당도: str, 무게: str, 착색비율: str, 수량: str):
    try:
        등급 = classify_fruit(당도, 무게, 착색비율)
        단가 = 단가_책정(등급)
        
        # 등급이 이미 존재하는지 확인
        cur.execute("SELECT 수량 FROM 귤 WHERE 등급 = %s", (등급,))
        result = cur.fetchone()
        
        if result:
            # 등급이 존재하면 수량을 업데이트
            새로운_수량 = int(result['수량']) + int(수량)
            cur.execute("UPDATE 귤 SET 수량 = %s WHERE 등급 = %s", (새로운_수량, 등급))
        else:
            # 등급이 존재하지 않으면 새로운 행을 삽입
            sql = "INSERT INTO 귤 (등급, 단가, 수량) VALUES (%s, %s, %s)"
            cur.execute(sql, (등급, 단가, 수량))
        
        conn.commit()
        return RedirectResponse(url="/search", status_code=303)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
@app.get("/mandarineSortedInfo/")
def get_mandarine_info():
    try:
         # 등급별로 수량의 합을 계산하는 쿼리
        sql = """
        SELECT 등급, SUM(수량) AS 총수량, 단가 
        FROM 귤
        GROUP BY 등급, 단가
        """
        cur.execute(sql)
        rows = cur.fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail="No data found")
        
        # 결과를 JSON 형식으로 변환
        result = {row['등급']: {"수량": row['총수량'], "단가": row['단가']} for row in rows}
        
        return result
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 주문 데이터 모델 정의
class Order(BaseModel):
    customer_id: int
    orders: dict

@app.post("/orderInfo/")
async def order_info(request: Request):
    form_data = await request.form()
    customer_id = form_data.get("customer_id")
    
    try:
        for key, value in form_data.items():
            if key.startswith("quantity_"):
                grade = key.split("_")[1]
                quantity = int(value)

                # 귤 테이블에서 해당 등급의 수량 업데이트
                cur.execute("UPDATE 귤 SET 수량 = 수량 - %s WHERE 등급 = %s AND 수량 >= %s", (quantity, grade, quantity))
                if cur.rowcount == 0:
                    raise HTTPException(status_code=400, detail=f"Not enough stock for grade {grade}")

                # 주문 테이블에 데이터 추가
                sql = """
                INSERT INTO 주문 (구매수량, 처리상태, 귤_등급, 고객_고객_id)
                VALUES (%s, '미처리', %s, %s)
                """
                cur.execute(sql, (quantity, grade, customer_id))
        
        conn.commit()
        return RedirectResponse(url="/", status_code=303)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orderlistInfo/")
def get_mandarine_by_id():
    try:
        sql = "SELECT * FROM 주문"
        cur.execute(sql)
        row = cur.fetchall()
        conn.commit()  # 커밋을 통해 변경 사항을 반영합니다.
        print(row)  # 디버깅용 출력
        if not row:
            raise HTTPException(status_code=404, detail="No data found")
        return row
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # 에러 발생 시 롤백합니다.
        raise HTTPException(status_code=500, detail=str(e))
    
### 고객별 총액 조회 ###(totalprice)
# 고객 ID 입력 시, 처리상태 = " 미처리" 인 상품들의 단가 총합을 표시
@app.get("/totalprice/")
def get_customer_total_price(customer_id: int):
    try:
        sql = """
        SELECT 고객.고객_id, SUM(귤.단가 * 주문.구매수량) AS 총가격
        FROM 주문
        JOIN 고객 ON 주문.고객_고객_id = 고객.고객_id
        JOIN 귤 ON 주문.귤_등급 = 귤.등급
        WHERE 고객.고객_id = %s AND 주문.처리상태 = '미처리'
        GROUP BY 고객.고객_id
        """
        cur.execute(sql, (customer_id,))
        row = cur.fetchall()
        conn.commit()
        if not row:
            raise HTTPException(status_code=404, detail="No data found")
        return row
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/order_historyInfo/")
def get_order_history():
    try:
        sql = "SELECT * FROM 주문"
        cur.execute(sql)
        rows = cur.fetchall()
        conn.commit()  # 커밋을 통해 변경 사항을 반영합니다.
        if not rows:
            raise HTTPException(status_code=404, detail="No data found")
        return rows
    except Exception as e:
        conn.rollback()  # 에러 발생 시 롤백합니다.
        raise HTTPException(status_code=500, detail=str(e))
        
### 포장 ###
#미처리인 상태인 고객 ID를 풀링해서 하나의 포장번호를 부여
# 1. 고객 ID에 대하여 미처리 상태인 주문을 조회
@app.get("/input_id/", response_class=HTMLResponse)
async def input_id_form(request: Request):
    return templates.TemplateResponse("input_id.html", {"request": request})
#2. 검색
@app.get("/searchorders/", response_class=HTMLResponse)
async def search_orders(request: Request, customer_id: int):
    try:
        sql = "SELECT 주문번호, 구매수량, 고객_고객_id, 처리상태 FROM 주문 WHERE 고객_고객_id = %s"
        cur.execute(sql, (customer_id,))
        orders = cur.fetchall()
        return templates.TemplateResponse("search_result.html", {"request": request, "orders": orders, "customer_id": customer_id})
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
#3. 포장
@app.post("/wraporders/")
async def wrap_orders(customer_id: int = Form(...)):
    try:
        # Fetch orders for the customer
        sql = "SELECT 주문번호, 구매수량 FROM 주문 WHERE 고객_고객_id = %s AND 처리상태 = '미처리'"
        cur.execute(sql, (customer_id,))
        orders = cur.fetchall()

        # Insert into 포장 table without 주문번호 reference
        for order in orders:
            sql = "INSERT INTO 포장 (배송기사_배송기사_id) VALUES (NULL)"
            cur.execute(sql)

        # Update 주문 table
        sql = "UPDATE 주문 SET 처리상태 = '포장' WHERE 고객_고객_id = %s AND 처리상태 = '미처리'"
        cur.execute(sql, (customer_id,))

        conn.commit()
        return RedirectResponse(url="/", status_code=303)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))        
def classify_fruit(당도, 무게, 착색비율):
    당도 = int(당도)
    무게 = int(무게)
    착색비율 = int(착색비율)
    
    if 당도 >= 14:
        if 무게 > 100:
            return "특"  # 1번 조건
        elif 무게 <= 100:
            if 착색비율 > 70:
                return "상"  # 3번 조건
            else:
                return "보통"  # 4번 조건
    elif 11 <= 당도 < 14:
        if 무게 > 100:
            if 착색비율 > 70:
                return "특"  # 5번 조건
            else:
                return "상"  # 6번 조건
        elif 무게 <= 100:
            if 착색비율 > 70:
                return "특"  # 7번 조건
            else:
                return "보통"  # 8번 조건
    elif 당도 < 11:
        if 무게 > 100:
            if 착색비율 > 70:
                return "상"  # 9번 조건
            else:
                return "보통"  # 10번 조건
        elif 무게 <= 100:
            if 착색비율 > 70:
                return "비매용"  # 11번 조건
            else:
                return "비매용"  # 12번 조건
    elif 무게 < 50:
        return "비매용"  # 13번 조건
    return None

def 단가_책정(등급):
    if 등급 == "특" :
        return "1200"
    elif 등급 == "상":
        return "800"
    elif 등급 == "보통":
        return "600"
    else:
        return '0'