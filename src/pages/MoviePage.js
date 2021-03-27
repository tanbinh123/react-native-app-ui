import React, {Component} from 'react';
import {StyleSheet, View,Image,Text,FlatList} from "react-native";
import {HOST} from "../config";
import {getCategoryList,getAllCategoryListByPageName} from "../service";
import CarouselComponent from "../components/CarouselComponent";
import CategoryComponent from "../components/CategoryComponent";
import SearchBarComponent from "../components/SearchBarComponent";
import {connect} from "react-redux";
class  MoviePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            carouselData:[],//轮播数据
            allCategoryListByPageName:[],//按页面名称获取所有小类
            dataSource:[[]],//当前显示的小类，懒加载
            pageNum:1,//分类的数量
            loading:false
        }
    }

    initData=()=>{
        this.state.dataSource = [[]],//当前显示的小类，懒加载
        //获取轮播数据
        getCategoryList("电影","轮播").then((res)=>{
            let {dataSource} = this.state;
            dataSource[0] = res.data;
            this.setState({dataSource});
        });

        getAllCategoryListByPageName("电影").then((res)=>{
            let {allCategoryListByPageName,dataSource} = this.state;
            allCategoryListByPageName.push(...res.data);
            let temp = res.data.slice(0,2);
            let count = 0;
            temp.forEach(({classify,category},index)=>{
                getCategoryList(classify,category).then((res)=>{
                    dataSource[index+2] = res.data;
                }).finally(()=>{
                    count++;
                    if(count == temp.length){
                        this.setState({dataSource});
                    }
                })
            })
            this.setState({allCategoryListByPageName});
        });
    }

    componentDidMount(){
        this.initData();
    }

    getCategoryListData=({classify,category})=>{
        let {dataSource} = this.state;
        this.state.loading = true;
        this.setState({loading:true});
        getCategoryList(classify,category).then((res)=>{
            dataSource.push(res.data)
        }).finally(()=>{
            this.state.loading = false;
            this.setState({
                loading:false,
                dataSource
            })
        })
    }

    _renderItem=({item,index})=>{
        if(index == 0){
            return <CarouselComponent carouselData={item}></CarouselComponent>
        }else if(item && item.length>0){
            return <CategoryComponent categoryList={item}></CategoryComponent>
        }else{
            return null
        }
    }

    _onRefresh=()=>{
        this.initData()
    }

    _onEndReached=()=>{
        let {pageNum,allCategoryListByPageName} = this.state;
        if(pageNum < allCategoryListByPageName.length-1){
            pageNum++
            this.state.pageNum = pageNum;
            this.setState({pageNum})
            this.getCategoryListData(allCategoryListByPageName[pageNum]);
        }
    }

    _renderFooter=()=>{
        let {pageNum,allCategoryListByPageName} = this.state;
        if(pageNum < allCategoryListByPageName.length-1){
            return  <View style={styles.footer}><Text>正在加载中</Text></View>
        }else if(pageNum >= allCategoryListByPageName.length-1 && allCategoryListByPageName.length != 0){
            return <View style={styles.footer}><Text>没有更多了</Text></View>
        }else{
            return null
        }

    }

    render() {
        let {loading,dataSource} = this.state;
        let {userData={}} = this.props;
        let {avater=""} = userData;
        return (
            <View style={styles.wrapper}>
                <View style={styles.headerWrapper}>
                    {avater ? <Image roundAsCircle={true} style={styles.imageStyle} source={{uri:HOST+avater}}></Image>:null}
                    <View style={styles.searchWrapper}>
                        <SearchBarComponent classify={"电影"}></SearchBarComponent>
                    </View>
                </View>
                <FlatList
                    data={dataSource}
                    style={styles.scrollViewWrapper}
                    onRefresh={this._onRefresh}
                    refreshing={loading}
                    onEndReached={this._onEndReached}
                    onEndReachedThreshold={0.1}  // 这里取值0.1，可以根据实际情况调整，取值尽量小
                    ListFooterComponent={this._renderFooter}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    //设置下拉加载更多的指示器的位置
                    progressViewOffset={50}
                ></FlatList>
            </View>
        );
    }
}

export default  connect((state)=>{
    let {userData} = state;
    return {
        userData
      }
})(MoviePage);

const styles = StyleSheet.create({
    wrapper:{
        flexDirection:'column',
        flex:1
    },
    headerWrapper: {
        display:"flex",
        justifyContent:"center",
        flexDirection:'row',
        margin:20,
    },
    searchWrapper:{
        height:50,
        flex:1,
        marginLeft:10
    },
    carouselWrapper:{
        height:250
    },
    scrollViewWrapper:{
        flex:1,
    },
    imageStyle: {
        // margin:10,
        width: 50,
        height: 50,
        backgroundColor: '#C0C0C0',
        borderRadius:50,
        // 显示模式：缩略全显contain，拉升全显（会变形）stretch，裁剪后显示（默认）cover
        resizeMode:'cover',
    },

    footer:{
        margin:20,
        justifyContent:"center",
        alignItems:"center"
    },
    // 菊花图
    loadingMore: {
        marginVertical: 20
    },
});
