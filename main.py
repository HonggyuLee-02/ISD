from fastapi import FastAPI, HTTPException, Query, Form
from fastapi.templating import Jinja2Templates
from fastapi import Request
from fastapi.responses import RedirectResponse
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


@app.get("/insert/")
async def home(request: Request):
    return templates.TemplateResponse("insert.html",{"request":request})

@app.get("/items/")
async def read_item(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]

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
def insert_info( 당도:str, 무게:str, 착색비율:str, 수량:str):
    try:
        sql = "INSERT INTO 귤 (등급, 단가, 수량 ) VALUES (%s, %s, %s)"
        등급 = classify_fruit(당도,무게,착색비율)
        단가 = 단가_책정(등급)
        cur.execute(sql, (등급, 단가, 수량))
        conn.commit()
        return RedirectResponse(url="/search", status_code=303)
    except Exception as e:
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
        return {"message": "Order successfully placed"}
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