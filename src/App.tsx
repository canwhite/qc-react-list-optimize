/* eslint-disable no-unused-vars */
/* import logo from './logo.svg'; */
import './App.css';
import {useInfiniteScroll, useMount, useReactive, useVirtualList} from "ahooks"
import {useRef,useMemo} from "react"

/*------------------------------------------------
target:滚动自动加载和大量数据处理
-------------------------------------------------*/

//结果类型限制
interface  Result {
  list:string[];
  nextId:string  | undefined;
}


function App() {

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const originalList = useMemo(() => Array.from(Array(99999).keys()), []);

  const [list] = useVirtualList(originalList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 60,
    overscan: 10,
  });


  useMount(()=>{
    const resultData = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
    state.resultData = resultData;
  })



  //这种类似于双向绑定是即时值，useState却是需要刷新才会更改的
  //如果要保留上一个值，可以使用setState手动更新
  const state = useReactive({
    resultData:[] as string[], 
  })


  function getLoadMoreList(nextId:string | undefined ,limit:number):Promise<Result>{
    //确定数据选择的初始位置
    let start = 0;
    if(nextId){
      start =state.resultData.findIndex((i)=>i === nextId); 
    }

    //然后考虑结尾部分
    const end  = start + limit;
    //slice浅拷贝，左闭右开
    //这里也可以是一个请求
    const list = state.resultData.slice(start,end);
    //然后重新搞一下下一组的起点
    const nId = state.resultData.length > end ? state.resultData[end] :undefined;
    
    return new Promise(resolve=>{
      setTimeout(() => {
        resolve({
          list,
          nextId:nId
        })
      }, 1000);
    });
  }

  const ref = useRef<HTMLDivElement>(null);

  //data
  const { data, loading, loadMore, loadingMore, noMore } = useInfiniteScroll(
    (d) => getLoadMoreList(d?.nextId, 4),
    {
      target: ref,
      isNoMore: (d) => d?.nextId === undefined,
    },
  );

  return (
    <div> 
      <div style={{padding:20}}>
      --方案一：infinite无限加载，自动加载更多--
      </div>
      <div ref={ref} style={{  height: 150, overflow: 'auto', border: '1px solid', padding: 20,marginTop:20 }}>

        {/* 根据loading判断加载 */}
        {loading ? (
          <p>loading</p>
        ) : (
          <div>
            {data?.list?.map((item) => (
              <div key={item} style={{ padding: 12, border: '1px solid #f5f5f5' }}>
                item-{item}
              </div>
            ))}
          </div>
        )}

        {/* 根据是某有更多，判断是不是到底了，或者显示中间load状态 */}
        <div style={{ marginTop: 8 }}>
          {!noMore && (
            <button type="button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading more...' : 'Click to load more'}
            </button>
          )}

          {noMore && <span>No more data</span>}
        </div>
      </div>
      <div style={{padding:20}}>
      --方案二：虚拟列表，用于解决展示海量数据渲染时首屏渲染缓慢和滚动卡顿问题--
      </div>
      <div ref={containerRef} style={{ height: '300px', overflow: 'auto', border: '1px solid' }}>
        <div ref={wrapperRef}>
          {list.map((ele) => (
            <div
              style={{
                height: 52,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #e8e8e8',
                marginBottom: 8,
              }}
              key={ele.index}
            >
              Row: {ele.data}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
