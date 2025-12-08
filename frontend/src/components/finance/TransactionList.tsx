interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
}

interface TransactionListProps {
    transactions?: Transaction[];
}

function TransactionList({ transactions = [] }: TransactionListProps) {
    return (
        <div className="transaction-list">
            {transactions.length === 0 ? (
                <p>No transactions</p>
            ) : (
                <ul>
                    {transactions.map((transaction) => (
                        <li key={transaction.id} className="transaction-item">
                            <span>{transaction.description}</span>
                            <span>{transaction.amount}</span>
                            <span>{transaction.date}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TransactionList;

