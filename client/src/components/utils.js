
export const formatTimeStamp = (date) => {
    const postedDate = new Date(date);
    if (isNaN(postedDate)) return 'Invalid date';
    //console.log('Received date:', postedDate);
    
    const curr = new Date();
    const diffSec = Math.floor((curr-postedDate) / 1000);
    if (diffSec < 60) 
    {
    return `${diffSec} seconds ago`;
    }
    const diffMin = Math.floor((diffSec) / 60);
    if (diffMin < 60) 
    {
    return `${diffMin} minutes ago`;
    }
    const diffHour = Math.floor((diffMin) / 60);
    if (diffHour < 24) 
    {
    return `${diffHour} hours ago`;
    }
    const diffDay = Math.floor((diffHour) / 24);
    if (diffDay < 30) 
    {
    return `${diffDay} days ago`;
    }
    const diffMonth = Math.floor((diffDay) / 30);
    if (diffMonth < 12) 
    {
    return `${diffMonth} month(s) ago`;
    }
    const diffYear = Math.floor((diffMonth) / 12);
    return `${diffYear} year(s) ago`;
};


export const sortNewest = (posts) => {
    return [...posts].sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));
};

export const sortOldest = (posts) => {
    return [...posts].sort((a,b) => new Date(a.postedDate) - new Date(b.postedDate));
};

export const sortActive = (posts, comments) => {
    return [...posts].sort((a, b) => {
        const latestCommentA = getLatestCommentTime(a, comments);
        const latestCommentB = getLatestCommentTime(b, comments);
        return new Date(latestCommentB) - new Date  (latestCommentA);
      });
};

export const getLatestCommentTime = (post, comments) => {
    if (!post.commentIDs.length) return 0; 
    let latestCommentDate = post.postedDate;
    
    post.commentIDs.forEach(commentID => {
        const comment = comments.find(c => c._id === commentID);
        if (comment && new Date(comment.commentedDate) > latestCommentDate) {
        latestCommentDate = new Date(comment.commentedDate);
        }
    });

    return latestCommentDate;
};


  
