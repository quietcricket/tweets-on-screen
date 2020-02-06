import hashlib
import hmac
import base64
import secrets
import json
import os

print("Create a user account with email and the password is randomly generated.")

email = input("Email: ")
password = secrets.token_urlsafe(8)
secret = secrets.token_urlsafe(16)
hash_key = base64.b64encode(bytes(secret, 'utf-8')).decode('ascii')
password_hash = base64.b64encode(hmac.new(bytes(secret, 'utf-8'), bytes(password, 'utf-8'), digestmod=hashlib.sha256).digest())

data = {'users': [{'localId': email, 'email': email, 'passwordHash': password_hash.decode('ascii')}]}

TEMP_FILENAME = '.temp_user.json'
fh = open(TEMP_FILENAME, 'w')
fh.write(json.dumps(data))
fh.close()

os.system('firebase auth:import %s --hash-algo=HMAC_SHA256 --hash-key=%s' % (TEMP_FILENAME, hash_key))
os.unlink(TEMP_FILENAME)

print("----- Account created successfully -----")
print("Email: %s, Password: %s" % (email, password))
