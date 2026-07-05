from database import table

response = table.put_item(
    Item={
        "shortCode": "abc123",
        "originalUrl": "https://google.com",
        "clicks": 0
    }
)

print("Inserted Successfully!")
print(response)