import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';




function App (){

    const [rawData, setRawData] = useState();
    const [chartData, setChartData] = useState({
        line1: 'Israel',
        line2: 'China'
    });
    const [selectOptions, setSelectOptions] = useState([])
    

    useEffect(() => {   
        fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
        .then(res => res.text())
        .then(res => {
            let splited = res.split('\n')
            splited = splited.map(row => row.split(','))
            const data = []
            for(let day = 4; day < splited[0].length; day++){
                const dayData={}
                for(let country = 1; country < splited.length; country++){
                    dayData[`${splited[country][1]} ${splited[country][0] ? `(${splited[country][0]})` : ''}`] = splited[country][day]
                }
                data.push({
                    date: splited[0][day],
                    ...dayData
                })
            }
            setRawData(data)

            const countries = Object.keys(data[0]).slice(1).map(country => {
                return {
                    value: country,
                    label: country
                }
            })
            setSelectOptions(countries)
        }) 
    }, [])

    const handleChange = React.useCallback((line, country) => {
        setChartData({
            ...chartData,
            [line]: country
        })
        
    }, [chartData])

    const getMax = React.useCallback(() => {
        if(rawData){
            const values = rawData.map(day => [parseInt(day[chartData.line1]) || 0, parseInt(day[chartData.line2]) || 0]).flat()
            console.log(values)
            // return Math.max(...values)
        }
            
    }, [chartData])

    getMax()
    return(
        <>
            {rawData && <div>
                <LineChart width={730} height={500} data={rawData}
                    margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis type='number'/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={chartData.line1} stroke="#8884d8" />
                    <Line type="monotone" dataKey={chartData.line2} stroke="#82ca9d" />
                </LineChart>
            </div>}
            <div style={{width: "50vw", margin: "auto"}}>
                <Select options={selectOptions} defaultInputValue={'Israel'} onChange={(e) => handleChange('line1', e.value)}/> 
                <Select options={selectOptions} defaultInputValue={'China'} onChange={(e) => handleChange('line2', e.value)}/> 
            </div>
        </>
    )
}

export default App