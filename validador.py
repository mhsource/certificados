from transitions import Machine
import requests

class FileValidator:
    def __init__(self):
        self.file_type = ""

    def is_document_valid(self):
        response = requests.get("http://demo8254035.mockable.io/teste")
        response.raise_for_status()
        data = response.json()
        return self.file_type == data.get("type")

    def on_enter(self):
        print("Esta tipificação é valida!")

    def on_enter_invalid(self):
        print("Esta tipificação é invalida!")

transitions = [
    {'trigger': 'check', 'source': 'start', 'dest': 'RG', 'conditions': 'is_document_valid','after':'on_enter'},
    {'trigger': 'check', 'source': 'start', 'dest': 'CPF', 'conditions': 'is_document_valid','after':'on_enter'},
    {'trigger': 'check', 'source': 'start', 'dest': 'PASSAPORTE', 'conditions': 'is_document_valid','after':'on_enter'},
    {'trigger': 'check', 'source': 'start', 'dest': 'invalid', 'unless': ['is_document_valid']}
]

states = set(transition['source'] for transition in transitions).union(
    transition['dest'] for transition in transitions
)

validator = FileValidator()
machine = Machine(model=validator, states=list(states), transitions=transitions, initial='start')

def validate_file(file):
    validator.file_type = file
    print(f"\nValidating file: {file}")
    validator.check()

validate_file("CPF")
