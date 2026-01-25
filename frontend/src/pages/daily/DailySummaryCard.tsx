interface DailySummaryCardProps {
    date?: string;
    summary?: string;
}

function DailySummaryCard({ date, summary }: DailySummaryCardProps) {
    return (
        <div className="daily-summary-card">
            {date && <span className="date">{date}</span>}
            {summary && <p className="summary">{summary}</p>}
        </div>
    );
}

export default DailySummaryCard;

