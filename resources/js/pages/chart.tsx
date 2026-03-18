import { TrendingUp } from 'lucide-react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const COLORS = ['#22c55e', '#ef4444'];

interface Props {
    total_voters: number;
    votes_cast: number;
    not_voted: number;
}

export function ChartPieDonutText({ total_voters, votes_cast, not_voted }: Props) {
    const chartData = [
        { name: 'Voted', value: votes_cast },
        { name: 'Not Voted', value: not_voted },
    ];

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Voting Result</CardTitle>
                <CardDescription>Current Status</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pb-0">
                <PieChart width={250} height={250}>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={100}
                        strokeWidth={3}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index]} />
                        ))}

                        <Label
                            position="center"
                            content={({ viewBox }) => {
                                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-3xl font-bold"
                                            >
                                                {total_voters}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 22}
                                                className="fill-muted-foreground"
                                            >
                                                Total Voters
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />
                    </Pie>
                </PieChart>
            </CardContent>

            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium">
                    Trending up by 5.2% <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground">Showing voting status</div>
            </CardFooter>
        </Card>
    );
}
