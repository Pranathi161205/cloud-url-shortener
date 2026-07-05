from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse

from database import table
from models import URLRequest
from utils import generate_short_code
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "CloudURL Backend Running"}


@app.post("/api/shorten")
def shorten_url(request: URLRequest, http_request: Request):
    if "/api/" in request.url:
        raise HTTPException(status_code=400, detail="Please enter a valid website URL")

    short_code = generate_short_code()

    table.put_item(
        Item={
            "shortCode": short_code,
            "originalUrl": request.url,
            "clicks": 0
        }
    )

    base_url = str(http_request.base_url).rstrip("/")

    return {
        "shortCode": short_code,
        "shortUrl": f"{base_url}/{short_code}"
    }

@app.get("/api/urls")
def get_urls():

    response = table.scan()

    items = response.get("Items", [])

    return items
@app.delete("/api/url/{short_code}")
def delete_url(short_code: str):

    response = table.get_item(
        Key={
            "shortCode": short_code
        }
    )

    if "Item" not in response:
        raise HTTPException(
            status_code=404,
            detail="Short URL not found"
        )

    table.delete_item(
        Key={
            "shortCode": short_code
        }
    )

    return {
        "message": "URL deleted successfully"
    }


@app.get("/{short_code}")
def redirect_url(short_code: str):

    response = table.get_item(
        Key={
            "shortCode": short_code
        }
    )

    if "Item" not in response:
        raise HTTPException(
            status_code=404,
            detail="Short URL not found"
        )

    item = response["Item"]

    table.update_item(
        Key={
            "shortCode": short_code
        },
        UpdateExpression="SET clicks = clicks + :inc",
        ExpressionAttributeValues={
            ":inc": 1
        }
    )

    return RedirectResponse(
        url=item["originalUrl"],
        status_code=302
    )