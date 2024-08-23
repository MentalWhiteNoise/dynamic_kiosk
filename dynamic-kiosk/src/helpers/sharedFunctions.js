export function openInNewTab(url){
    //console.log("here:", url)
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}
export const formatDate= (date) =>{
    if (date == null) return null
    return (new Date(date)).toISOString().substring(0,10)
} 
export const applyColumnSort = (valueA, valueB, sortOnProp, sortDesc, defaultSortProp) => {    
    if (valueA[sortOnProp] > valueB[sortOnProp]) return (sortDesc) ? -1 : 1
    if (valueA[sortOnProp] < valueB[sortOnProp]) return (sortDesc) ? 1 : -1
    if (defaultSortProp && valueA[defaultSortProp] > valueB[defaultSortProp]) return 1
    if (defaultSortProp && valueA[defaultSortProp] < valueB[defaultSortProp]) return -1
    return 0
}