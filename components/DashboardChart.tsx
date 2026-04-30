"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

//dummy data
const data = [
    { name: "Mon", interactions: 12, notes: 2 },
    { name: "Tue", interactions: 25, notes: 4 },
    { name: "Wed", interactions: 10, notes: 1 },
    { name: "Thu", interactions: 40, notes: 7 },
    { name: "Fri", interactions: 35, notes: 5 },
    { name: "Sat", interactions: 15, notes: 2 },
    { name: "Sun", interactions: 20, notes: 3 },
]

export function DashboardChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                />
                <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="interactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="AI Interactions" />
                <Bar dataKey="notes" fill="#ec4899" radius={[4, 4, 0, 0]} name="Notes Created" />
            </BarChart>
        </ResponsiveContainer>
    )
}