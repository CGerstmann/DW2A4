const Modal = {
    open(){
        // Abrir modal
        // Add a class active ao Modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close(){
        // Fechar o modal
        // Remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}
    
    // Eu preciso somar as entradas
    // depois eu preciso somar as sáidas e 
    // remover das entradas o valor das saídas
    // assim, eu terei o total

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    // somar a uma variável e retornar a variavel
    
    incomes() { // somar as entradas
        let income = 0;
            // pegar todas as transações
            // para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero
            if(transaction.amount > 0){
                // somar a uma variável e retornar a variavel
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses() { // somar as saídas
        let expense = 0;
            // pegar todas as transações
            // para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for menor que zero
            if(transaction.amount < 0){
                // somar a uma variável e retornar a variavel
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total(){ // entradas - saídas
        return Transaction.incomes() + Transaction.expenses();
    }

}

// Substituir os dados do HTML com os dados do JS
const DOM = { // DOM - Document Object Model
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement ('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
        
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        
        const html = `        
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img  onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `
        return html
    },

    updateBalance() {
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions () {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils ={
    formatAmount(value) {
        value = value * 100
        
        return Math.round(value)
    },
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = (Number(value) / 100)

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency:"BRL"
        })

        return signal + value
    }
}

const Form = { 
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value 
        }
        
    },
    
    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if( description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos.")
        }
    },

    money (value) {
        const cleanValue = +value.replace(/\D+/g, '')
        const options = { style: 'currency', currency: 'BRL' }
        return new Intl.NumberFormat('pt-br', options).format(cleanValue / 100)
      },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)
       
        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        
        try {
            //Verificar se todas s informações foram prenchidas
            Form.validateFields()
            //Formatar os dados para salvar
            const transaction = Form.formatValues()
            //Salvar
            Transaction.add(transaction)
            //Apaga os dados do formulario
            Form.clearFields()
            //Fechar modal
            Modal.close()            
        } catch (error) {
            alert(error.message)
        }

        
    }
}

const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
                
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
