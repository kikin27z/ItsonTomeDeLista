import uuid

def create_class_code(prefix='MUGI') -> str:
    raw_code = str(uuid.uuid4())
    return f'{prefix.upper()}-{raw_code[:8].upper()}'
