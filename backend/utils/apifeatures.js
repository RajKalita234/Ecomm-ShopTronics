class ApiFeatures {
    constructor(query,queryStr){    // query here is for eg. Product.find(); from getAllProducts API and queryStr is keyword = Samosa
         this.query = query;
         this.queryStr = queryStr;
    }

    search(){
        console.log('queryStr', this.queryStr);     // this will be keyword user will search
        const keyword = this.queryStr.keyword
         ? {
                name: {
                    $regex: this.queryStr.keyword,      // $regex is of MongoDB's property
                    $options: "i",          // means search keyword must be case insensitive. Either ABC or abc
                },
            }
          : {};

          this.query = this.query.find({...keyword});
          return this;      // means returing this entire class itself
    }

    filter(){
        const queryCopy = {...this.queryStr};       // ex: { keyword: 'Samsung' }
        // Removing some fields for category
        const removeFields = ["keyword", "page", "limit"];

        removeFields.forEach((key) => delete queryCopy[key]);

        // Filter for Price and Rating

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key => `$${key}`);
        
        
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1;    // by default page no will be 1 if no user input.
        const skip = resultPerPage * (currentPage - 1);     // this logic is for when we want to skip to next page.
        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    }
};

module.exports = ApiFeatures;
