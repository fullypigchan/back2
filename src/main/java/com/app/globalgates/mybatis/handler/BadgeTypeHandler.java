package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.BadgeType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(BadgeType.class)
public class BadgeTypeHandler implements TypeHandler<BadgeType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, BadgeType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public BadgeType getResult(ResultSet rs, String columnName) throws SQLException {
        return BadgeType.getBadgeType(rs.getString(columnName));
    }

    @Override
    public BadgeType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return BadgeType.getBadgeType(rs.getString(columnIndex));
    }

    @Override
    public BadgeType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return BadgeType.getBadgeType(cs.getString(columnIndex));
    }
}
